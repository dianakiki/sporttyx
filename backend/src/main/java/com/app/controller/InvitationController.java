package com.app.controller;

import com.app.dto.InvitationResponse;
import com.app.dto.InviteParticipantRequest;
import com.app.dto.MessageResponse;
import com.app.model.TeamInvitation;
import com.app.security.JwtUtil;
import com.app.service.InvitationService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import javax.servlet.http.HttpServletRequest;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api")
@CrossOrigin(origins = "http://localhost:3000")
public class InvitationController {
    
    @Autowired
    private InvitationService invitationService;
    
    @Autowired
    private JwtUtil jwtUtil;
    
    @GetMapping("/participants/{participantId}/invitations")
    public ResponseEntity<List<InvitationResponse>> getParticipantInvitations(
            @PathVariable Long participantId) {
        List<InvitationResponse> invitations = invitationService.getParticipantInvitations(participantId);
        return ResponseEntity.ok(invitations);
    }
    
    @PostMapping("/teams/{teamId}/invite")
    public ResponseEntity<TeamInvitation> createInvitation(
            @PathVariable Long teamId,
            @RequestBody InviteParticipantRequest request,
            HttpServletRequest httpRequest) {
        Long invitedById = extractUserIdFromRequest(httpRequest);
        TeamInvitation invitation = invitationService.createInvitation(
                teamId, request.getParticipantId(), invitedById, request.getMessage());
        return ResponseEntity.status(HttpStatus.CREATED).body(invitation);
    }
    
    @PostMapping("/invitations/{invitationId}/accept")
    public ResponseEntity<Map<String, Object>> acceptInvitation(
            @PathVariable Long invitationId,
            HttpServletRequest httpRequest) {
        Long userId = extractUserIdFromRequest(httpRequest);
        invitationService.acceptInvitation(invitationId, userId);
        
        Map<String, Object> response = new HashMap<>();
        response.put("message", "Invitation accepted");
        return ResponseEntity.ok(response);
    }
    
    @PostMapping("/invitations/{invitationId}/decline")
    public ResponseEntity<MessageResponse> declineInvitation(
            @PathVariable Long invitationId,
            HttpServletRequest httpRequest) {
        Long userId = extractUserIdFromRequest(httpRequest);
        invitationService.declineInvitation(invitationId, userId);
        return ResponseEntity.ok(new MessageResponse("Invitation declined"));
    }
    
    private Long extractUserIdFromRequest(HttpServletRequest request) {
        String authHeader = request.getHeader("Authorization");
        if (authHeader != null && authHeader.startsWith("Bearer ")) {
            String token = authHeader.substring(7);
            return jwtUtil.extractUserId(token);
        }
        throw new RuntimeException("No valid token found");
    }
}
