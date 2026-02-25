package com.app.service;

import com.app.dto.*;
import com.app.model.*;
import com.app.repository.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import javax.servlet.http.HttpServletRequest;
import java.security.SecureRandom;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;

@Service
public class EventInvitationService {
    
    @Autowired
    private EventInvitationRepository eventInvitationRepository;
    
    @Autowired
    private EventInvitationUsageRepository eventInvitationUsageRepository;
    
    @Autowired
    private EventRepository eventRepository;
    
    @Autowired
    private ParticipantRepository participantRepository;
    
    @Autowired
    private EventParticipantRepository eventParticipantRepository;
    
    @Autowired
    private PasswordEncoder passwordEncoder;
    
    @Value("${app.frontend.url:http://localhost:3000}")
    private String frontendUrl;
    
    private static final String TOKEN_CHARS = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
    private static final int TOKEN_LENGTH = 32;
    private static final SecureRandom random = new SecureRandom();
    
    @Transactional
    public EventInvitationResponse createInvitation(CreateEventInvitationRequest request, Long createdById) {
        Event event = eventRepository.findById(request.getEventId())
                .orElseThrow(() -> new RuntimeException("Event not found"));
        
        Participant createdBy = participantRepository.findById(createdById)
                .orElseThrow(() -> new RuntimeException("User not found"));
        
        EventInvitation invitation = new EventInvitation();
        invitation.setEvent(event);
        invitation.setInvitationToken(generateUniqueToken());
        invitation.setDescription(request.getDescription());
        invitation.setMaxUses(request.getMaxUses());
        invitation.setExpiresAt(request.getExpiresAt());
        invitation.setCreatedBy(createdBy);
        
        invitation = eventInvitationRepository.save(invitation);
        
        return toEventInvitationResponse(invitation);
    }
    
    @Transactional
    public EventInvitationResponse updateInvitation(Long invitationId, CreateEventInvitationRequest request, Long userId) {
        EventInvitation invitation = eventInvitationRepository.findById(invitationId)
                .orElseThrow(() -> new RuntimeException("Invitation not found"));
        
        if (request.getDescription() != null) {
            invitation.setDescription(request.getDescription());
        }
        if (request.getMaxUses() != null) {
            invitation.setMaxUses(request.getMaxUses());
        }
        if (request.getExpiresAt() != null) {
            invitation.setExpiresAt(request.getExpiresAt());
        }
        
        invitation = eventInvitationRepository.save(invitation);
        
        return toEventInvitationResponse(invitation);
    }
    
    @Transactional
    public void deactivateInvitation(Long invitationId, Long userId) {
        EventInvitation invitation = eventInvitationRepository.findById(invitationId)
                .orElseThrow(() -> new RuntimeException("Invitation not found"));
        
        invitation.setIsActive(false);
        eventInvitationRepository.save(invitation);
    }
    
    @Transactional
    public void activateInvitation(Long invitationId, Long userId) {
        EventInvitation invitation = eventInvitationRepository.findById(invitationId)
                .orElseThrow(() -> new RuntimeException("Invitation not found"));
        
        invitation.setIsActive(true);
        eventInvitationRepository.save(invitation);
    }
    
    @Transactional
    public void deleteInvitation(Long invitationId, Long userId) {
        EventInvitation invitation = eventInvitationRepository.findById(invitationId)
                .orElseThrow(() -> new RuntimeException("Invitation not found"));
        
        eventInvitationRepository.delete(invitation);
    }
    
    public List<EventInvitationResponse> getEventInvitations(Long eventId) {
        return eventInvitationRepository.findByEventId(eventId)
                .stream()
                .map(this::toEventInvitationResponse)
                .collect(Collectors.toList());
    }
    
    public EventInvitationResponse getInvitationByToken(String token) {
        EventInvitation invitation = eventInvitationRepository.findByInvitationToken(token)
                .orElseThrow(() -> new RuntimeException("Invitation not found"));
        
        return toEventInvitationResponse(invitation);
    }
    
    @Transactional
    public Participant registerWithInvitation(RegisterWithInvitationRequest request, HttpServletRequest httpRequest) {
        EventInvitation invitation = eventInvitationRepository.findByInvitationToken(request.getInvitationToken())
                .orElseThrow(() -> new RuntimeException("Invalid invitation token"));
        
        validateInvitation(invitation);
        
        if (participantRepository.findByUsername(request.getUsername()).isPresent()) {
            throw new RuntimeException("Username already exists");
        }
        
        Participant participant = new Participant();
        participant.setUsername(request.getUsername());
        participant.setPassword(passwordEncoder.encode(request.getPassword()));
        participant.setName(request.getName());
        participant.setEmail(request.getEmail());
        participant.setPhone(request.getPhone());
        participant.setRole(Role.USER);
        
        participant = participantRepository.save(participant);
        
        EventParticipant eventParticipant = new EventParticipant();
        eventParticipant.setEvent(invitation.getEvent());
        eventParticipant.setParticipant(participant);
        eventParticipant.setStatus(EventParticipantStatus.ACCEPTED);
        eventParticipant.setInvitedBy(invitation.getCreatedBy());
        eventParticipant.setJoinedAt(LocalDateTime.now());
        eventParticipantRepository.save(eventParticipant);
        
        EventInvitationUsage usage = new EventInvitationUsage();
        usage.setInvitation(invitation);
        usage.setParticipant(participant);
        usage.setIpAddress(getClientIpAddress(httpRequest));
        usage.setUserAgent(httpRequest.getHeader("User-Agent"));
        eventInvitationUsageRepository.save(usage);
        
        invitation.setTimesUsed(invitation.getTimesUsed() + 1);
        eventInvitationRepository.save(invitation);
        
        return participant;
    }
    
    public EventInvitationStatsResponse getEventInvitationStats(Long eventId) {
        Event event = eventRepository.findById(eventId)
                .orElseThrow(() -> new RuntimeException("Event not found"));
        
        List<EventInvitation> invitations = eventInvitationRepository.findByEventId(eventId);
        List<EventInvitationUsage> allUsages = eventInvitationUsageRepository.findByEventIdOrderByUsedAtDesc(eventId);
        
        int totalInvitations = invitations.size();
        int activeInvitations = (int) invitations.stream()
                .filter(inv -> inv.getIsActive() && !isExpired(inv) && !isMaxedOut(inv))
                .count();
        int totalRegistrations = allUsages.size();
        
        Map<String, Integer> registrationsByDay = allUsages.stream()
                .collect(Collectors.groupingBy(
                        usage -> usage.getUsedAt().toLocalDate().toString(),
                        Collectors.collectingAndThen(Collectors.counting(), Long::intValue)
                ));
        
        List<EventInvitationResponse> invitationResponses = invitations.stream()
                .map(this::toEventInvitationResponse)
                .collect(Collectors.toList());
        
        List<EventInvitationUsageResponse> recentUsages = allUsages.stream()
                .limit(50)
                .map(this::toEventInvitationUsageResponse)
                .collect(Collectors.toList());
        
        return new EventInvitationStatsResponse(
                eventId,
                event.getName(),
                totalInvitations,
                activeInvitations,
                totalRegistrations,
                registrationsByDay,
                invitationResponses,
                recentUsages
        );
    }
    
    public List<EventInvitationUsageResponse> getInvitationUsages(Long invitationId) {
        return eventInvitationUsageRepository.findByInvitationId(invitationId)
                .stream()
                .map(this::toEventInvitationUsageResponse)
                .collect(Collectors.toList());
    }
    
    private void validateInvitation(EventInvitation invitation) {
        if (!invitation.getIsActive()) {
            throw new RuntimeException("This invitation link is no longer active");
        }
        
        if (isExpired(invitation)) {
            throw new RuntimeException("This invitation link has expired");
        }
        
        if (isMaxedOut(invitation)) {
            throw new RuntimeException("This invitation link has reached its maximum usage limit");
        }
    }
    
    private boolean isExpired(EventInvitation invitation) {
        return invitation.getExpiresAt() != null && 
               LocalDateTime.now().isAfter(invitation.getExpiresAt());
    }
    
    private boolean isMaxedOut(EventInvitation invitation) {
        return invitation.getMaxUses() != null && 
               invitation.getTimesUsed() >= invitation.getMaxUses();
    }
    
    private String generateUniqueToken() {
        String token;
        do {
            token = generateRandomToken();
        } while (eventInvitationRepository.findByInvitationToken(token).isPresent());
        return token;
    }
    
    private String generateRandomToken() {
        StringBuilder sb = new StringBuilder(TOKEN_LENGTH);
        for (int i = 0; i < TOKEN_LENGTH; i++) {
            sb.append(TOKEN_CHARS.charAt(random.nextInt(TOKEN_CHARS.length())));
        }
        return sb.toString();
    }
    
    private String getClientIpAddress(HttpServletRequest request) {
        String xForwardedFor = request.getHeader("X-Forwarded-For");
        if (xForwardedFor != null && !xForwardedFor.isEmpty()) {
            return xForwardedFor.split(",")[0].trim();
        }
        
        String xRealIp = request.getHeader("X-Real-IP");
        if (xRealIp != null && !xRealIp.isEmpty()) {
            return xRealIp;
        }
        
        return request.getRemoteAddr();
    }
    
    private EventInvitationResponse toEventInvitationResponse(EventInvitation invitation) {
        String invitationUrl = frontendUrl + "/register?invite=" + invitation.getInvitationToken();
        
        return new EventInvitationResponse(
                invitation.getId(),
                invitation.getEvent().getId(),
                invitation.getEvent().getName(),
                invitation.getInvitationToken(),
                invitationUrl,
                invitation.getDescription(),
                invitation.getMaxUses(),
                invitation.getTimesUsed(),
                invitation.getExpiresAt(),
                invitation.getIsActive(),
                isExpired(invitation),
                isMaxedOut(invitation),
                invitation.getCreatedBy().getName(),
                invitation.getCreatedAt()
        );
    }
    
    private EventInvitationUsageResponse toEventInvitationUsageResponse(EventInvitationUsage usage) {
        return new EventInvitationUsageResponse(
                usage.getId(),
                usage.getInvitation().getId(),
                usage.getInvitation().getDescription(),
                usage.getParticipant().getId(),
                usage.getParticipant().getName(),
                usage.getParticipant().getUsername(),
                usage.getIpAddress(),
                usage.getUsedAt()
        );
    }
}
