package com.app.service;

import com.app.dto.ChangePasswordRequest;
import com.app.dto.EventResponse;
import com.app.dto.ParticipantRankingResponse;
import com.app.dto.ParticipantResponse;
import com.app.dto.ParticipantSearchResponse;
import com.app.dto.ParticipantUpdateRequest;
import com.app.model.Event;
import com.app.model.EventParticipant;
import com.app.model.EventParticipantStatus;
import com.app.model.Participant;
import com.app.model.TeamParticipant;
import com.app.repository.ActivityRepository;
import com.app.repository.EventParticipantRepository;
import com.app.repository.EventRepository;
import com.app.repository.ParticipantRepository;
import com.app.repository.TeamParticipantRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.Comparator;
import java.util.List;
import java.util.concurrent.atomic.AtomicInteger;
import java.util.stream.Collectors;
import java.util.stream.Stream;

@Service
public class ParticipantService {
    
    @Autowired
    private ParticipantRepository participantRepository;
    
    @Autowired
    private TeamParticipantRepository teamParticipantRepository;
    
    @Autowired
    private ActivityRepository activityRepository;
    
    @Autowired
    private PasswordEncoder passwordEncoder;
    
    @Autowired
    private EventRepository eventRepository;
    
    @Autowired
    private EventService eventService;
    
    @Autowired
    private EventParticipantRepository eventParticipantRepository;
    
    public ParticipantResponse getParticipant(Long id) {
        Participant participant = participantRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Participant not found"));
        
        Long teamId = null;
        String teamName = null;
        Long eventId = null;
        List<TeamParticipant> teams = teamParticipantRepository.findByParticipantId(id);
        if (!teams.isEmpty()) {
            teamId = teams.get(0).getTeam().getId();
            teamName = teams.get(0).getTeam().getName();
            if (teams.get(0).getTeam().getEvent() != null) {
                eventId = teams.get(0).getTeam().getEvent().getId();
            }
        }
        
        return new ParticipantResponse(
                participant.getId(),
                participant.getUsername(),
                participant.getName(),
                participant.getEmail(),
                participant.getPhone(),
                participant.getProfileImageUrl(),
                participant.getRole().name(),
                teamId,
                teamName,
                eventId
        );
    }
    
    public ParticipantResponse updateParticipant(Long id, ParticipantUpdateRequest request) {
        Participant participant = participantRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Participant not found"));
        
        if (request.getName() != null) {
            participant.setName(request.getName());
        }
        if (request.getEmail() != null) {
            participant.setEmail(request.getEmail());
        }
        if (request.getPhone() != null) {
            participant.setPhone(request.getPhone());
        }
        if (request.getProfileImageUrl() != null) {
            participant.setProfileImageUrl(request.getProfileImageUrl());
        }
        
        participant = participantRepository.save(participant);
        
        return getParticipant(participant.getId());
    }
    
    public void deleteParticipant(Long id) {
        participantRepository.deleteById(id);
    }
    
    public List<ParticipantSearchResponse> searchParticipants(String query) {
        return participantRepository.searchByName(query).stream()
                .map(p -> new ParticipantSearchResponse(p.getId(), p.getName()))
                .collect(Collectors.toList());
    }
    
    public void changePassword(Long id, ChangePasswordRequest request) {
        Participant participant = participantRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Participant not found"));
        
        if (!passwordEncoder.matches(request.getOldPassword(), participant.getPassword())) {
            throw new com.app.exception.InvalidPasswordException("Неверный текущий пароль");
        }
        
        participant.setPassword(passwordEncoder.encode(request.getNewPassword()));
        participant.setPasswordResetRequired(false);
        participantRepository.save(participant);
    }
    
    public List<ParticipantRankingResponse> getParticipantRankings(Long eventId) {
        // Получаем всех участников с их активностями для данного мероприятия
        List<Participant> participants = participantRepository.findAll();
        
        // Подсчитываем баллы для каждого участника
        List<ParticipantRankingResponse> rankings = participants.stream()
                .map(participant -> {
                    Integer totalPoints = activityRepository.findByParticipantIdOrderByCreatedAtDesc(participant.getId())
                            .stream()
                            .filter(activity -> activity.getTeam() != null 
                                    && activity.getTeam().getEvent() != null 
                                    && activity.getTeam().getEvent().getId().equals(eventId))
                            .mapToInt(activity -> activity.getEnergy() != null ? activity.getEnergy() : 0)
                            .sum();
                    
                    return new ParticipantRankingResponse(
                            participant.getId(),
                            participant.getName(),
                            participant.getUsername(),
                            totalPoints,
                            0, // rank будет установлен позже
                            participant.getProfileImageUrl()
                    );
                })
                .filter(ranking -> ranking.getTotalPoints() > 0) // Показываем только участников с баллами
                .sorted(Comparator.comparing(ParticipantRankingResponse::getTotalPoints).reversed())
                .collect(Collectors.toList());
        
        // Устанавливаем ранги
        AtomicInteger rank = new AtomicInteger(1);
        rankings.forEach(ranking -> ranking.setRank(rank.getAndIncrement()));
        
        return rankings;
    }
    
    public List<EventResponse> getParticipantEvents(Long participantId) {
        // Получаем команды пользователя
        List<TeamParticipant> userTeams = teamParticipantRepository.findByParticipantId(participantId);
        
        // Получаем события через команды
        List<Event> eventsFromTeams = userTeams.stream()
                .map(tp -> tp.getTeam().getEvent())
                .filter(event -> event != null)
                .distinct()
                .collect(Collectors.toList());
        
        // Получаем события через принятые приглашения
        List<EventParticipant> acceptedInvitations = eventParticipantRepository
                .findByParticipantIdAndStatus(participantId, EventParticipantStatus.ACCEPTED);
        
        List<Event> eventsFromInvitations = acceptedInvitations.stream()
                .map(EventParticipant::getEvent)
                .filter(event -> event != null)
                .collect(Collectors.toList());
        
        // Объединяем и удаляем дубликаты
        return Stream.concat(eventsFromTeams.stream(), eventsFromInvitations.stream())
                .distinct()
                .sorted((e1, e2) -> e2.getStartDate().compareTo(e1.getStartDate()))
                .map(event -> eventService.toEventResponse(event))
                .collect(Collectors.toList());
    }
}
