package com.app.controller;

import com.app.dto.CommentResponse;
import com.app.dto.CreateCommentRequest;
import com.app.dto.MessageResponse;
import com.app.dto.ReactionRequest;
import com.app.model.Participant;
import com.app.repository.ParticipantRepository;
import com.app.service.ActivityCommentService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api")
@CrossOrigin(origins = "http://localhost:3000")
public class ActivityCommentController {
    
    @Autowired
    private ActivityCommentService activityCommentService;
    
    @Autowired
    private ParticipantRepository participantRepository;
    
    @PostMapping("/activities/{id}/comments")
    public ResponseEntity<CommentResponse> createComment(
            @PathVariable Long id,
            @RequestBody CreateCommentRequest request,
            Authentication authentication) {
        
        Participant participant = participantRepository.findByUsername(authentication.getName())
                .orElseThrow(() -> new RuntimeException("User not found"));
        CommentResponse response = activityCommentService.createComment(id, participant.getId(), request);
        
        return ResponseEntity.ok(response);
    }
    
    @PutMapping("/comments/{id}")
    public ResponseEntity<CommentResponse> updateComment(
            @PathVariable Long id,
            @RequestBody CreateCommentRequest request,
            Authentication authentication) {
        
        Participant participant = participantRepository.findByUsername(authentication.getName())
                .orElseThrow(() -> new RuntimeException("User not found"));
        CommentResponse response = activityCommentService.updateComment(id, participant.getId(), request.getText());
        
        return ResponseEntity.ok(response);
    }
    
    @DeleteMapping("/comments/{id}")
    public ResponseEntity<?> deleteComment(
            @PathVariable Long id,
            Authentication authentication) {
        
        Participant participant = participantRepository.findByUsername(authentication.getName())
                .orElseThrow(() -> new RuntimeException("User not found"));
        activityCommentService.deleteComment(id, participant.getId());
        
        return ResponseEntity.ok(new MessageResponse("Comment deleted successfully"));
    }
    
    @GetMapping("/activities/{id}/comments")
    public ResponseEntity<List<CommentResponse>> getActivityComments(
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
        
        List<CommentResponse> comments = activityCommentService.getActivityComments(id, currentUserId);
        return ResponseEntity.ok(comments);
    }
    
    @PostMapping("/comments/{id}/reactions")
    public ResponseEntity<?> addOrUpdateCommentReaction(
            @PathVariable Long id,
            @RequestBody ReactionRequest request,
            Authentication authentication) {
        
        Participant participant = participantRepository.findByUsername(authentication.getName())
                .orElseThrow(() -> new RuntimeException("User not found"));
        activityCommentService.addOrUpdateCommentReaction(id, participant.getId(), request.getReactionType());
        
        return ResponseEntity.ok(new MessageResponse("Reaction added successfully"));
    }
    
    @DeleteMapping("/comments/{id}/reactions")
    public ResponseEntity<?> removeCommentReaction(
            @PathVariable Long id,
            Authentication authentication) {
        
        Participant participant = participantRepository.findByUsername(authentication.getName())
                .orElseThrow(() -> new RuntimeException("User not found"));
        activityCommentService.removeCommentReaction(id, participant.getId());
        
        return ResponseEntity.ok(new MessageResponse("Reaction removed successfully"));
    }
}
