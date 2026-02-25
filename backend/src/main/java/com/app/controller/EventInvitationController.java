package com.app.controller;

import com.app.dto.*;
import com.app.model.Participant;
import com.app.repository.ParticipantRepository;
import com.app.service.EventInvitationService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import javax.servlet.http.HttpServletRequest;
import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api")
@CrossOrigin(origins = "http://localhost:3000")
public class EventInvitationController {
    
    @Autowired
    private EventInvitationService eventInvitationService;
    
    @Autowired
    private ParticipantRepository participantRepository;
    
    @PostMapping("/admin/event-invitations")
    public ResponseEntity<EventInvitationResponse> createInvitation(
            @RequestBody CreateEventInvitationRequest request,
            @AuthenticationPrincipal UserDetails userDetails) {
        Long userId = getCurrentUserId(userDetails);
        EventInvitationResponse response = eventInvitationService.createInvitation(request, userId);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }
    
    @PutMapping("/admin/event-invitations/{id}")
    public ResponseEntity<EventInvitationResponse> updateInvitation(
            @PathVariable Long id,
            @RequestBody CreateEventInvitationRequest request,
            @AuthenticationPrincipal UserDetails userDetails) {
        Long userId = getCurrentUserId(userDetails);
        EventInvitationResponse response = eventInvitationService.updateInvitation(id, request, userId);
        return ResponseEntity.ok(response);
    }
    
    @PostMapping("/admin/event-invitations/{id}/deactivate")
    public ResponseEntity<Void> deactivateInvitation(
            @PathVariable Long id,
            @AuthenticationPrincipal UserDetails userDetails) {
        Long userId = getCurrentUserId(userDetails);
        eventInvitationService.deactivateInvitation(id, userId);
        return ResponseEntity.ok().build();
    }
    
    @PostMapping("/admin/event-invitations/{id}/activate")
    public ResponseEntity<Void> activateInvitation(
            @PathVariable Long id,
            @AuthenticationPrincipal UserDetails userDetails) {
        Long userId = getCurrentUserId(userDetails);
        eventInvitationService.activateInvitation(id, userId);
        return ResponseEntity.ok().build();
    }
    
    @DeleteMapping("/admin/event-invitations/{id}")
    public ResponseEntity<Void> deleteInvitation(
            @PathVariable Long id,
            @AuthenticationPrincipal UserDetails userDetails) {
        Long userId = getCurrentUserId(userDetails);
        eventInvitationService.deleteInvitation(id, userId);
        return ResponseEntity.noContent().build();
    }
    
    @GetMapping("/admin/events/{eventId}/invitations")
    public ResponseEntity<List<EventInvitationResponse>> getEventInvitations(@PathVariable Long eventId) {
        List<EventInvitationResponse> invitations = eventInvitationService.getEventInvitations(eventId);
        return ResponseEntity.ok(invitations);
    }
    
    @GetMapping("/admin/events/{eventId}/invitation-stats")
    public ResponseEntity<EventInvitationStatsResponse> getEventInvitationStats(@PathVariable Long eventId) {
        EventInvitationStatsResponse stats = eventInvitationService.getEventInvitationStats(eventId);
        return ResponseEntity.ok(stats);
    }
    
    @GetMapping("/admin/event-invitations/{id}/usages")
    public ResponseEntity<List<EventInvitationUsageResponse>> getInvitationUsages(@PathVariable Long id) {
        List<EventInvitationUsageResponse> usages = eventInvitationService.getInvitationUsages(id);
        return ResponseEntity.ok(usages);
    }
    
    @GetMapping("/public/invitation/{token}")
    public ResponseEntity<EventInvitationResponse> getInvitationByToken(@PathVariable String token) {
        try {
            EventInvitationResponse invitation = eventInvitationService.getInvitationByToken(token);
            return ResponseEntity.ok(invitation);
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }
    
    @PostMapping("/public/register-with-invitation")
    public ResponseEntity<?> registerWithInvitation(
            @RequestBody RegisterWithInvitationRequest request,
            HttpServletRequest httpRequest) {
        try {
            Participant participant = eventInvitationService.registerWithInvitation(request, httpRequest);
            return ResponseEntity.status(HttpStatus.CREATED).body(participant);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }
    
    private Long getCurrentUserId(UserDetails userDetails) {
        if (userDetails == null) {
            return null;
        }
        Optional<Participant> participant = participantRepository.findByUsername(userDetails.getUsername());
        return participant.map(Participant::getId).orElse(null);
    }
}
