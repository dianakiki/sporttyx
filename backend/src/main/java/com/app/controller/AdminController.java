package com.app.controller;

import com.app.dto.*;
import com.app.model.ActivityType;
import com.app.model.Event;
import com.app.model.Participant;
import com.app.model.Role;
import com.app.model.Team;
import com.app.repository.ActivityTypeRepository;
import com.app.repository.ParticipantRepository;
import com.app.repository.TeamRepository;
import com.app.service.EventService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/admin")
@CrossOrigin(origins = "http://localhost:3000")
public class AdminController {
    
    @Autowired
    private ParticipantRepository participantRepository;
    
    @Autowired
    private TeamRepository teamRepository;
    
    @Autowired
    private ActivityTypeRepository activityTypeRepository;
    
    @Autowired
    private EventService eventService;
    
    @Autowired
    private com.app.repository.EventRepository eventRepository;
    
    @Autowired
    private PasswordEncoder passwordEncoder;
    
    /**
     * Получить список всех участников (админ)
     */
    @GetMapping("/participants")
    public ResponseEntity<List<ParticipantResponse>> getAllParticipants() {
        List<Participant> participants = participantRepository.findAll();
        List<ParticipantResponse> responses = participants.stream()
                .map(p -> new ParticipantResponse(
                        p.getId(),
                        p.getUsername(),
                        p.getName(),
                        p.getEmail(),
                        p.getPhone(),
                        p.getProfileImageUrl(),
                        p.getRole().name(),
                        null,
                        null,
                        null
                ))
                .collect(Collectors.toList());
        return ResponseEntity.ok(responses);
    }
    
    /**
     * Создать нового участника (админ)
     */
    @PostMapping("/participants")
    public ResponseEntity<ParticipantResponse> createParticipant(@RequestBody CreateParticipantRequest request) {
        if (participantRepository.findByUsername(request.getUsername()).isPresent()) {
            throw new RuntimeException("Username already exists");
        }
        
        Participant participant = new Participant();
        participant.setUsername(request.getUsername());
        participant.setPassword(passwordEncoder.encode(request.getPassword()));
        participant.setName(request.getName());
        participant.setEmail(request.getEmail());
        participant.setPhone(request.getPhone());
        
        if (request.getRole() != null) {
            participant.setRole(Role.valueOf(request.getRole()));
        }
        
        participant = participantRepository.save(participant);
        
        ParticipantResponse response = new ParticipantResponse(
                participant.getId(),
                participant.getUsername(),
                participant.getName(),
                participant.getEmail(),
                participant.getPhone(),
                participant.getProfileImageUrl(),
                participant.getRole().name(),
                null,
                null,
                null
        );
        
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }
    
    /**
     * Обновить данные участника (админ)
     */
    @PutMapping("/participants/{id}")
    public ResponseEntity<ParticipantResponse> updateParticipant(@PathVariable Long id, @RequestBody CreateParticipantRequest request) {
        Participant participant = participantRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Participant not found"));
        
        participant.setName(request.getName());
        participant.setEmail(request.getEmail());
        participant.setPhone(request.getPhone());
        
        if (request.getRole() != null) {
            participant.setRole(Role.valueOf(request.getRole()));
        }
        
        participant = participantRepository.save(participant);
        
        ParticipantResponse response = new ParticipantResponse(
                participant.getId(),
                participant.getUsername(),
                participant.getName(),
                participant.getEmail(),
                participant.getPhone(),
                participant.getProfileImageUrl(),
                participant.getRole().name(),
                null,
                null,
                null
        );
        
        return ResponseEntity.ok(response);
    }
    
    /**
     * Сбросить пароль участника на username (админ)
     */
    @PostMapping("/participants/{id}/reset-password")
    public ResponseEntity<Void> resetPassword(@PathVariable Long id) {
        Participant participant = participantRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Participant not found"));
        
        participant.setPassword(passwordEncoder.encode(participant.getUsername()));
        participant.setPasswordResetRequired(true);
        participantRepository.save(participant);
        
        return ResponseEntity.ok().build();
    }
    
    /**
     * Удалить участника (админ)
     */
    @DeleteMapping("/participants/{id}")
    public ResponseEntity<Void> deleteParticipant(@PathVariable Long id) {
        participantRepository.deleteById(id);
        return ResponseEntity.noContent().build();
    }
    
    /**
     * Получить список всех команд (админ)
     */
    @GetMapping("/teams")
    public ResponseEntity<List<TeamListResponse>> getAllTeamsAdmin() {
        List<Team> teams = teamRepository.findAll();
        List<TeamListResponse> responses = teams.stream()
                .map(t -> new TeamListResponse(t.getId(), t.getName()))
                .collect(Collectors.toList());
        return ResponseEntity.ok(responses);
    }
    
    /**
     * Создать новую команду (админ)
     */
    @PostMapping("/teams")
    public ResponseEntity<Team> createTeamAdmin(@RequestBody CreateTeamAdminRequest request) {
        Team team = new Team();
        team.setName(request.getName());
        team.setMotto(request.getMotto());
        team.setImageUrl(request.getImageUrl());
        
        if (request.getEventId() != null) {
            Event event = eventRepository.findById(request.getEventId())
                    .orElseThrow(() -> new RuntimeException("Event not found"));
            team.setEvent(event);
        }
        
        team = teamRepository.save(team);
        return ResponseEntity.status(HttpStatus.CREATED).body(team);
    }
    
    /**
     * Удалить команду (админ)
     */
    @DeleteMapping("/teams/{id}")
    public ResponseEntity<Void> deleteTeamAdmin(@PathVariable Long id) {
        teamRepository.deleteById(id);
        return ResponseEntity.noContent().build();
    }
    
    /**
     * Получить список всех типов активностей (админ)
     */
    @GetMapping("/activity-types")
    public ResponseEntity<List<ActivityTypeResponse>> getAllActivityTypesAdmin() {
        List<ActivityType> types = activityTypeRepository.findAll();
        List<ActivityTypeResponse> responses = types.stream()
                .map(t -> new ActivityTypeResponse(t.getId(), t.getName(), t.getDescription(), t.getDefaultEnergy()))
                .collect(Collectors.toList());
        return ResponseEntity.ok(responses);
    }
    
    /**
     * Создать новый тип активности (админ)
     */
    @PostMapping("/activity-types")
    public ResponseEntity<ActivityType> createActivityType(@RequestBody CreateActivityTypeRequest request) {
        ActivityType activityType = new ActivityType();
        activityType.setName(request.getName());
        activityType.setDescription(request.getDescription());
        activityType.setDefaultEnergy(request.getDefaultEnergy());
        
        if (request.getEventId() != null) {
            Event event = eventRepository.findById(request.getEventId())
                    .orElseThrow(() -> new RuntimeException("Event not found"));
            activityType.setEvent(event);
        }
        
        activityType = activityTypeRepository.save(activityType);
        return ResponseEntity.status(HttpStatus.CREATED).body(activityType);
    }
    
    /**
     * Удалить тип активности (админ)
     */
    @DeleteMapping("/activity-types/{id}")
    public ResponseEntity<Void> deleteActivityType(@PathVariable Long id) {
        activityTypeRepository.deleteById(id);
        return ResponseEntity.noContent().build();
    }
    
    /**
     * Получить список всех событий (админ)
     */
    @GetMapping("/events")
    public ResponseEntity<List<EventListResponse>> getAllEventsAdmin() {
        List<EventListResponse> events = eventService.getAllEvents();
        return ResponseEntity.ok(events);
    }
    
    /**
     * Создать новое событие (админ)
     */
    @PostMapping("/events")
    public ResponseEntity<EventResponse> createEvent(@RequestBody EventRequest request) {
        EventResponse event = eventService.createEvent(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(event);
    }
    
    /**
     * Обновить событие (админ)
     */
    @PutMapping("/events/{id}")
    public ResponseEntity<EventResponse> updateEvent(@PathVariable Long id, @RequestBody EventRequest request) {
        EventResponse event = eventService.updateEvent(id, request);
        return ResponseEntity.ok(event);
    }
    
    /**
     * Удалить событие (админ)
     */
    @DeleteMapping("/events/{id}")
    public ResponseEntity<Void> deleteEvent(@PathVariable Long id) {
        eventService.deleteEvent(id);
        return ResponseEntity.noContent().build();
    }
    
    /**
     * Установить событие для отображения на главной странице (админ)
     */
    @PostMapping("/events/{id}/display")
    public ResponseEntity<EventResponse> setDisplayOnHomepage(@PathVariable Long id) {
        EventResponse event = eventService.setDisplayOnHomepage(id);
        return ResponseEntity.ok(event);
    }
    
    /**
     * Скрыть событие с главной страницы (админ)
     */
    @PostMapping("/events/{id}/hide")
    public ResponseEntity<Void> removeFromHomepage(@PathVariable Long id) {
        eventService.removeFromHomepage(id);
        return ResponseEntity.noContent().build();
    }
}
