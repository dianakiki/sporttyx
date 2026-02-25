package com.app.service;

import com.app.dto.EventAdminDto;
import com.app.dto.EventListResponse;
import com.app.dto.EventRequest;
import com.app.dto.EventResponse;
import com.app.model.*;
import com.app.repository.EventRepository;
import com.app.repository.ParticipantRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.Arrays;
import java.util.HashSet;
import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;

@Service
public class EventService {
    
    @Autowired
    private EventRepository eventRepository;
    
    @Autowired
    private ParticipantRepository participantRepository;
    
    public List<EventListResponse> getAllEvents() {
        return eventRepository.findAll().stream()
                .map(this::toListResponse)
                .collect(Collectors.toList());
    }
    
    public EventResponse getEvent(Long id) {
        Event event = eventRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Event not found"));
        return toResponse(event);
    }
    
    public List<EventResponse> getActiveEvents() {
        return eventRepository.findActiveEvents(LocalDateTime.now()).stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
    }
    
    public EventResponse getDisplayedEvent() {
        return eventRepository.findByDisplayOnHomepageTrue()
                .map(this::toResponse)
                .orElse(null);
    }
    
    @Transactional
    public EventResponse createEvent(EventRequest request) {
        Event event = new Event();
        updateEventFromRequest(event, request);
        event = eventRepository.save(event);
        return toResponse(event);
    }
    
    @Transactional
    public EventResponse updateEvent(Long id, EventRequest request) {
        Event event = eventRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Event not found"));
        
        // Check if trying to set status to ACTIVE
        if (request.getStatus() != null && "ACTIVE".equals(request.getStatus())) {
            // Check if there's already an active event (excluding current event)
            List<Event> activeEvents = eventRepository.findByStatus(EventStatus.ACTIVE);
            boolean hasOtherActiveEvent = activeEvents.stream()
                    .anyMatch(e -> !e.getId().equals(id));
            
            if (hasOtherActiveEvent) {
                throw new RuntimeException("Может быть только одно активное мероприятие. Сначала завершите или переведите в черновик текущее активное мероприятие.");
            }
        }
        
        updateEventFromRequest(event, request);
        event = eventRepository.save(event);
        return toResponse(event);
    }
    
    @Transactional
    public void deleteEvent(Long id) {
        eventRepository.deleteById(id);
    }
    
    @Transactional
    public EventResponse setDisplayOnHomepage(Long id) {
        // Убираем отображение со всех других мероприятий
        eventRepository.findByDisplayOnHomepageTrue()
                .ifPresent(event -> {
                    event.setDisplayOnHomepage(false);
                    eventRepository.save(event);
                });
        
        Event event = eventRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Event not found"));
        event.setDisplayOnHomepage(true);
        event = eventRepository.save(event);
        return toResponse(event);
    }
    
    @Transactional
    public void removeFromHomepage(Long id) {
        Event event = eventRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Event not found"));
        event.setDisplayOnHomepage(false);
        eventRepository.save(event);
    }
    
    private void updateEventFromRequest(Event event, EventRequest request) {
        if (request.getName() != null) {
            event.setName(request.getName());
        }
        if (request.getDescription() != null) {
            event.setDescription(request.getDescription());
        }
        if (request.getStartDate() != null) {
            event.setStartDate(request.getStartDate());
        }
        if (request.getEndDate() != null) {
            event.setEndDate(request.getEndDate());
        }
        if (request.getStatus() != null) {
            event.setStatus(EventStatus.valueOf(request.getStatus()));
        }
        if (request.getVisibility() != null) {
            event.setVisibility(EventVisibility.valueOf(request.getVisibility()));
        }
        if (request.getRequiresActivityApproval() != null) {
            event.setRequiresActivityApproval(request.getRequiresActivityApproval());
        }
        if (request.getMaxTeams() != null) {
            event.setMaxTeams(request.getMaxTeams());
        }
        if (request.getMaxParticipants() != null) {
            event.setMaxParticipants(request.getMaxParticipants());
        }
        if (request.getRegistrationDeadline() != null) {
            event.setRegistrationDeadline(request.getRegistrationDeadline());
        }
        if (request.getPointsMultiplier() != null) {
            event.setPointsMultiplier(request.getPointsMultiplier());
        }
        if (request.getCustomScoringRules() != null) {
            event.setCustomScoringRules(request.getCustomScoringRules());
        }
        if (request.getBannerImageUrl() != null) {
            event.setBannerImageUrl(request.getBannerImageUrl());
        }
        if (request.getLogoUrl() != null) {
            event.setLogoUrl(request.getLogoUrl());
        }
        if (request.getImageUrl() != null) {
            event.setImageUrl(request.getImageUrl());
        }
        if (request.getPrimaryColor() != null) {
            event.setPrimaryColor(request.getPrimaryColor());
        }
        if (request.getNotificationsEnabled() != null) {
            event.setNotificationsEnabled(request.getNotificationsEnabled());
        }
        if (request.getReminderDaysBefore() != null) {
            event.setReminderDaysBefore(request.getReminderDaysBefore());
        }
        if (request.getExternalEventId() != null) {
            event.setExternalEventId(request.getExternalEventId());
        }
        if (request.getWebhookUrl() != null) {
            event.setWebhookUrl(request.getWebhookUrl());
        }
        if (request.getDisplayOnHomepage() != null) {
            event.setDisplayOnHomepage(request.getDisplayOnHomepage());
        }
        if (request.getDashboardTypes() != null && !request.getDashboardTypes().isEmpty()) {
            event.setDashboardTypes(String.join(",", request.getDashboardTypes()));
        }
        if (request.getDashboardOrder() != null && !request.getDashboardOrder().isEmpty()) {
            event.setDashboardOrder(String.join(",", request.getDashboardOrder()));
        }
        if (request.getTeamBasedCompetition() != null) {
            event.setTeamBasedCompetition(request.getTeamBasedCompetition());
        }
        if (request.getTrackActivityDuration() != null) {
            event.setTrackActivityDuration(request.getTrackActivityDuration());
        }
        
        if (request.getEventAdminIds() != null) {
            Set<Participant> admins = new HashSet<>();
            for (Long adminId : request.getEventAdminIds()) {
                Participant admin = participantRepository.findById(adminId)
                        .orElseThrow(() -> new RuntimeException("Participant not found: " + adminId));
                admins.add(admin);
            }
            event.setEventAdmins(admins);
        }
    }
    
    public EventResponse toEventResponse(Event event) {
        return toResponse(event);
    }
    
    private EventResponse toResponse(Event event) {
        Set<EventAdminDto> adminDtos = event.getEventAdmins().stream()
                .map(p -> new EventAdminDto(p.getId(), p.getName(), p.getUsername()))
                .collect(Collectors.toSet());
        
        List<String> dashboardTypes = event.getDashboardTypes() != null && !event.getDashboardTypes().isEmpty()
                ? Arrays.asList(event.getDashboardTypes().split(","))
                : List.of();
        
        List<String> dashboardOrder = event.getDashboardOrder() != null && !event.getDashboardOrder().isEmpty()
                ? Arrays.asList(event.getDashboardOrder().split(","))
                : List.of();
        
        return new EventResponse(
                event.getId(),
                event.getName(),
                event.getDescription(),
                event.getStartDate(),
                event.getEndDate(),
                event.getStatus().name(),
                event.getVisibility().name(),
                event.getRequiresActivityApproval(),
                event.getMaxTeams(),
                event.getMaxParticipants(),
                event.getRegistrationDeadline(),
                event.getPointsMultiplier(),
                event.getCustomScoringRules(),
                event.getBannerImageUrl(),
                event.getLogoUrl(),
                event.getImageUrl(),
                event.getPrimaryColor(),
                event.getNotificationsEnabled(),
                event.getReminderDaysBefore(),
                event.getExternalEventId(),
                event.getWebhookUrl(),
                event.getDisplayOnHomepage(),
                dashboardTypes,
                dashboardOrder,
                event.getTeamBasedCompetition(),
                event.getTrackActivityDuration(),
                adminDtos,
                event.getCreatedAt(),
                event.getUpdatedAt()
        );
    }
    
    private EventListResponse toListResponse(Event event) {
        List<String> dashboardTypes = event.getDashboardTypes() != null && !event.getDashboardTypes().isEmpty()
                ? Arrays.asList(event.getDashboardTypes().split(","))
                : List.of();
        
        return new EventListResponse(
                event.getId(),
                event.getName(),
                event.getStartDate(),
                event.getEndDate(),
                event.getStatus().name(),
                event.getDisplayOnHomepage(),
                dashboardTypes
        );
    }
}
