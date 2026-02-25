package com.app.controller;

import com.app.dto.ActivityReactionResponse;
import com.app.dto.MessageResponse;
import com.app.dto.ReactionRequest;
import com.app.model.Participant;
import com.app.repository.ParticipantRepository;
import com.app.service.ActivityReactionService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/activities")
@CrossOrigin(origins = "http://localhost:3000")
public class ActivityReactionController {
    
    @Autowired
    private ActivityReactionService activityReactionService;
    
    @Autowired
    private ParticipantRepository participantRepository;
    
    @PostMapping("/{id}/reactions")
    public ResponseEntity<?> addOrUpdateReaction(
            @PathVariable Long id,
            @RequestBody ReactionRequest request,
            Authentication authentication) {
        
        Participant participant = participantRepository.findByUsername(authentication.getName())
                .orElseThrow(() -> new RuntimeException("User not found"));
        activityReactionService.addOrUpdateReaction(id, participant.getId(), request.getReactionType());
        
        return ResponseEntity.ok(new MessageResponse("Reaction added successfully"));
    }
    
    @DeleteMapping("/{id}/reactions")
    public ResponseEntity<?> removeReaction(
            @PathVariable Long id,
            Authentication authentication) {
        
        Participant participant = participantRepository.findByUsername(authentication.getName())
                .orElseThrow(() -> new RuntimeException("User not found"));
        activityReactionService.removeReaction(id, participant.getId());
        
        return ResponseEntity.ok(new MessageResponse("Reaction removed successfully"));
    }
    
    @GetMapping("/{id}/reactions")
    public ResponseEntity<ActivityReactionResponse> getActivityReactions(
            @PathVariable Long id,
            Authentication authentication) {
        
        Long currentUserId = null;
        if (authentication != null) {
            Participant participant = participantRepository.findByUsername(authentication.getName())
                    .orElse(null);
            if (participant != null) {
                currentUserId = participant.getId();
            }
        }
        
        ActivityReactionResponse response = activityReactionService.getActivityReactions(id, currentUserId);
        return ResponseEntity.ok(response);
    }
}
