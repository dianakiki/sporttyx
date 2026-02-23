package com.app.service;

import com.app.dto.EventParticipantResponse;
import com.app.model.*;
import com.app.repository.EventParticipantRepository;
import com.app.repository.EventRepository;
import com.app.repository.ParticipantRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
public class EventParticipantService {
    
    @Autowired
    private EventParticipantRepository eventParticipantRepository;
    
    @Autowired
    private EventRepository eventRepository;
    
    @Autowired
    private ParticipantRepository participantRepository;
    
    @Autowired
    private NotificationService notificationService;
    
    public List<EventParticipantResponse> inviteParticipantsToEvent(Long eventId, List<Long> participantIds, Long invitedById) {
        Event event = eventRepository.findById(eventId)
                .orElseThrow(() -> new RuntimeException("Event not found"));
        
        Participant invitedBy = participantRepository.findById(invitedById)
                .orElseThrow(() -> new RuntimeException("Admin not found"));
        
        return participantIds.stream()
                .map(participantId -> {
                    try {
                        Participant participant = participantRepository.findById(participantId)
                                .orElseThrow(() -> new RuntimeException("Participant not found: " + participantId));
                        
                        // Check if already has pending invitation or is already participating
                        Optional<EventParticipant> existingOpt = eventParticipantRepository.findByEventIdAndParticipantId(eventId, participantId);
                        
                        if (existingOpt.isPresent()) {
                            EventParticipant existing = existingOpt.get();
                            if (existing.getStatus() == EventParticipantStatus.PENDING) {
                                // Skip - already has pending invitation
                                return null;
                            }
                            if (existing.getStatus() == EventParticipantStatus.ACCEPTED) {
                                // Skip - already participating
                                return null;
                            }
                            // Reuse existing DECLINED record
                            existing.setStatus(EventParticipantStatus.PENDING);
                            existing.setInvitedBy(invitedBy);
                            existing.setInvitedAt(LocalDateTime.now());
                            existing.setJoinedAt(null);
                            
                            EventParticipant saved = eventParticipantRepository.save(existing);
                            
                            // Send notification
                            notificationService.createNotification(
                                participantId,
                                "Приглашение в мероприятие",
                                "Вы приглашены в мероприятие: " + event.getName(),
                                NotificationType.EVENT_INVITATION,
                                null
                            );
                            
                            return toEventParticipantResponse(saved);
                        } else {
                            // Create new invitation
                            EventParticipant newInvitation = new EventParticipant();
                            newInvitation.setEvent(event);
                            newInvitation.setParticipant(participant);
                            newInvitation.setInvitedBy(invitedBy);
                            newInvitation.setStatus(EventParticipantStatus.PENDING);
                            newInvitation.setInvitedAt(LocalDateTime.now());
                            
                            EventParticipant saved = eventParticipantRepository.save(newInvitation);
                            
                            // Send notification
                            notificationService.createNotification(
                                participantId,
                                "Приглашение в мероприятие",
                                "Вы приглашены в мероприятие: " + event.getName(),
                                NotificationType.EVENT_INVITATION,
                                null
                            );
                            
                            return toEventParticipantResponse(saved);
                        }
                    } catch (Exception e) {
                        // Skip this participant on error
                        return null;
                    }
                })
                .filter(response -> response != null)
                .collect(Collectors.toList());
    }
    
    public EventParticipantResponse acceptInvitation(Long invitationId, Long participantId) {
        EventParticipant eventParticipant = eventParticipantRepository.findById(invitationId)
                .orElseThrow(() -> new RuntimeException("Invitation not found"));
        
        if (!eventParticipant.getParticipant().getId().equals(participantId)) {
            throw new RuntimeException("Not authorized to accept this invitation");
        }
        
        if (eventParticipant.getStatus() != EventParticipantStatus.PENDING) {
            throw new RuntimeException("Invitation already processed");
        }
        
        eventParticipant.setStatus(EventParticipantStatus.ACCEPTED);
        eventParticipant.setJoinedAt(LocalDateTime.now());
        eventParticipant = eventParticipantRepository.save(eventParticipant);
        
        return toEventParticipantResponse(eventParticipant);
    }
    
    public EventParticipantResponse declineInvitation(Long invitationId, Long participantId) {
        EventParticipant eventParticipant = eventParticipantRepository.findById(invitationId)
                .orElseThrow(() -> new RuntimeException("Invitation not found"));
        
        if (!eventParticipant.getParticipant().getId().equals(participantId)) {
            throw new RuntimeException("Not authorized to decline this invitation");
        }
        
        if (eventParticipant.getStatus() != EventParticipantStatus.PENDING) {
            throw new RuntimeException("Invitation already processed");
        }
        
        eventParticipant.setStatus(EventParticipantStatus.DECLINED);
        eventParticipant = eventParticipantRepository.save(eventParticipant);
        
        return toEventParticipantResponse(eventParticipant);
    }
    
    public List<EventParticipantResponse> getParticipantInvitations(Long participantId) {
        return eventParticipantRepository.findByParticipantIdAndStatus(participantId, EventParticipantStatus.PENDING)
                .stream()
                .map(this::toEventParticipantResponse)
                .collect(Collectors.toList());
    }
    
    public List<EventParticipantResponse> getEventParticipants(Long eventId) {
        return eventParticipantRepository.findByEventId(eventId)
                .stream()
                .map(this::toEventParticipantResponse)
                .collect(Collectors.toList());
    }
    
    public boolean isParticipantInEvent(Long eventId, Long participantId) {
        return eventParticipantRepository.existsByEventIdAndParticipantIdAndStatus(
            eventId, participantId, EventParticipantStatus.ACCEPTED
        );
    }
    
    private EventParticipantResponse toEventParticipantResponse(EventParticipant ep) {
        return new EventParticipantResponse(
            ep.getId(),
            ep.getEvent().getId(),
            ep.getEvent().getName(),
            ep.getParticipant().getId(),
            ep.getParticipant().getName(),
            ep.getStatus().name(),
            ep.getInvitedAt(),
            ep.getJoinedAt(),
            ep.getInvitedBy() != null ? ep.getInvitedBy().getName() : null
        );
    }
}
