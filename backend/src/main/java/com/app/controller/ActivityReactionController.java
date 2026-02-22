package com.app.controller;

import com.app.dto.ActivityReactionResponse;
import com.app.dto.MessageResponse;
import com.app.dto.ReactionRequest;
import com.app.service.ActivityReactionService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/activities")
@CrossOrigin(origins = "*")
public class ActivityReactionController {
    
    @Autowired
    private ActivityReactionService activityReactionService;
    
    @PostMapping("/{id}/reactions")
    public ResponseEntity<?> addOrUpdateReaction(
            @PathVariable Long id,
            @RequestBody ReactionRequest request,
            Authentication authentication) {
        
        Long participantId = Long.parseLong(authentication.getName());
        activityReactionService.addOrUpdateReaction(id, participantId, request.getReactionType());
        
        return ResponseEntity.ok(new MessageResponse("Reaction added successfully"));
    }
    
    @DeleteMapping("/{id}/reactions")
    public ResponseEntity<?> removeReaction(
            @PathVariable Long id,
            Authentication authentication) {
        
        Long participantId = Long.parseLong(authentication.getName());
        activityReactionService.removeReaction(id, participantId);
        
        return ResponseEntity.ok(new MessageResponse("Reaction removed successfully"));
    }
    
    @GetMapping("/{id}/reactions")
    public ResponseEntity<ActivityReactionResponse> getActivityReactions(
            @PathVariable Long id,
            Authentication authentication) {
        
        Long currentUserId = null;
        if (authentication != null) {
            currentUserId = Long.parseLong(authentication.getName());
        }
        
        ActivityReactionResponse response = activityReactionService.getActivityReactions(id, currentUserId);
        return ResponseEntity.ok(response);
    }
}
