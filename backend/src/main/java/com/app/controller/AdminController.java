package com.app.controller;

import com.app.dto.*;
import com.app.model.ActivityType;
import com.app.model.Participant;
import com.app.model.Role;
import com.app.model.Team;
import com.app.repository.ActivityTypeRepository;
import com.app.repository.ParticipantRepository;
import com.app.repository.TeamRepository;
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
    private PasswordEncoder passwordEncoder;
    
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
                        null
                ))
                .collect(Collectors.toList());
        return ResponseEntity.ok(responses);
    }
    
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
                null
        );
        
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }
    
    @DeleteMapping("/participants/{id}")
    public ResponseEntity<Void> deleteParticipant(@PathVariable Long id) {
        participantRepository.deleteById(id);
        return ResponseEntity.noContent().build();
    }
    
    @GetMapping("/teams")
    public ResponseEntity<List<TeamListResponse>> getAllTeamsAdmin() {
        List<Team> teams = teamRepository.findAll();
        List<TeamListResponse> responses = teams.stream()
                .map(t -> new TeamListResponse(t.getId(), t.getName()))
                .collect(Collectors.toList());
        return ResponseEntity.ok(responses);
    }
    
    @PostMapping("/teams")
    public ResponseEntity<Team> createTeamAdmin(@RequestBody CreateTeamAdminRequest request) {
        Team team = new Team();
        team.setName(request.getName());
        team.setMotto(request.getMotto());
        team.setImageUrl(request.getImageUrl());
        team = teamRepository.save(team);
        return ResponseEntity.status(HttpStatus.CREATED).body(team);
    }
    
    @DeleteMapping("/teams/{id}")
    public ResponseEntity<Void> deleteTeamAdmin(@PathVariable Long id) {
        teamRepository.deleteById(id);
        return ResponseEntity.noContent().build();
    }
    
    @GetMapping("/activity-types")
    public ResponseEntity<List<ActivityTypeResponse>> getAllActivityTypesAdmin() {
        List<ActivityType> types = activityTypeRepository.findAll();
        List<ActivityTypeResponse> responses = types.stream()
                .map(t -> new ActivityTypeResponse(t.getId(), t.getName(), t.getDescription(), t.getDefaultEnergy()))
                .collect(Collectors.toList());
        return ResponseEntity.ok(responses);
    }
    
    @PostMapping("/activity-types")
    public ResponseEntity<ActivityType> createActivityType(@RequestBody CreateActivityTypeRequest request) {
        ActivityType activityType = new ActivityType();
        activityType.setName(request.getName());
        activityType.setDescription(request.getDescription());
        activityType.setDefaultEnergy(request.getDefaultEnergy());
        activityType = activityTypeRepository.save(activityType);
        return ResponseEntity.status(HttpStatus.CREATED).body(activityType);
    }
    
    @DeleteMapping("/activity-types/{id}")
    public ResponseEntity<Void> deleteActivityType(@PathVariable Long id) {
        activityTypeRepository.deleteById(id);
        return ResponseEntity.noContent().build();
    }
}
