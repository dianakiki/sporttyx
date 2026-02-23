package com.app.controller;

import com.app.dto.EventParticipantResponse;
import com.app.dto.InviteToEventRequest;
import com.app.model.Participant;
import com.app.repository.ParticipantRepository;
import com.app.service.EventParticipantService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api")
@CrossOrigin(origins = "http://localhost:3000")
public class EventParticipantController {
    
    @Autowired
    private EventParticipantService eventParticipantService;
    
    @Autowired
    private ParticipantRepository participantRepository;
    
    @PostMapping("/admin/events/invite")
    public ResponseEntity<List<EventParticipantResponse>> inviteParticipantsToEvent(
            @RequestBody InviteToEventRequest request,
            @AuthenticationPrincipal UserDetails userDetails) {
        Long adminId = getCurrentUserId(userDetails);
        List<EventParticipantResponse> responses = eventParticipantService.inviteParticipantsToEvent(
            request.getEventId(),
            request.getParticipantIds(),
            adminId
        );
        return ResponseEntity.status(HttpStatus.CREATED).body(responses);
    }
    
    @GetMapping("/events/{eventId}/participants")
    public ResponseEntity<List<EventParticipantResponse>> getEventParticipants(@PathVariable Long eventId) {
        List<EventParticipantResponse> participants = eventParticipantService.getEventParticipants(eventId);
        return ResponseEntity.ok(participants);
    }
    
    @GetMapping("/participants/event-invitations")
    public ResponseEntity<List<EventParticipantResponse>> getMyEventInvitations(
            @AuthenticationPrincipal UserDetails userDetails) {
        Long participantId = getCurrentUserId(userDetails);
        List<EventParticipantResponse> invitations = eventParticipantService.getParticipantInvitations(participantId);
        return ResponseEntity.ok(invitations);
    }
    
    @PostMapping("/event-invitations/{id}/accept")
    public ResponseEntity<EventParticipantResponse> acceptInvitation(
            @PathVariable Long id,
            @AuthenticationPrincipal UserDetails userDetails) {
        Long participantId = getCurrentUserId(userDetails);
        EventParticipantResponse response = eventParticipantService.acceptInvitation(id, participantId);
        return ResponseEntity.ok(response);
    }
    
    @PostMapping("/event-invitations/{id}/decline")
    public ResponseEntity<EventParticipantResponse> declineInvitation(
            @PathVariable Long id,
            @AuthenticationPrincipal UserDetails userDetails) {
        Long participantId = getCurrentUserId(userDetails);
        EventParticipantResponse response = eventParticipantService.declineInvitation(id, participantId);
        return ResponseEntity.ok(response);
    }
    
    private Long getCurrentUserId(UserDetails userDetails) {
        if (userDetails == null) {
            return null;
        }
        Optional<Participant> participant = participantRepository.findByUsername(userDetails.getUsername());
        return participant.map(Participant::getId).orElse(null);
    }
}
