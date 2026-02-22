package com.app.controller;

import com.app.dto.CommentResponse;
import com.app.dto.CreateCommentRequest;
import com.app.dto.MessageResponse;
import com.app.dto.ReactionRequest;
import com.app.service.ActivityCommentService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api")
@CrossOrigin(origins = "*")
public class ActivityCommentController {
    
    @Autowired
    private ActivityCommentService activityCommentService;
    
    @PostMapping("/activities/{id}/comments")
    public ResponseEntity<CommentResponse> createComment(
            @PathVariable Long id,
            @RequestBody CreateCommentRequest request,
            Authentication authentication) {
        
        Long participantId = Long.parseLong(authentication.getName());
        CommentResponse response = activityCommentService.createComment(id, participantId, request);
        
        return ResponseEntity.ok(response);
    }
    
    @PutMapping("/comments/{id}")
    public ResponseEntity<CommentResponse> updateComment(
            @PathVariable Long id,
            @RequestBody CreateCommentRequest request,
            Authentication authentication) {
        
        Long participantId = Long.parseLong(authentication.getName());
        CommentResponse response = activityCommentService.updateComment(id, participantId, request.getText());
        
        return ResponseEntity.ok(response);
    }
    
    @DeleteMapping("/comments/{id}")
    public ResponseEntity<?> deleteComment(
            @PathVariable Long id,
            Authentication authentication) {
        
        Long participantId = Long.parseLong(authentication.getName());
        activityCommentService.deleteComment(id, participantId);
        
        return ResponseEntity.ok(new MessageResponse("Comment deleted successfully"));
    }
    
    @GetMapping("/activities/{id}/comments")
    public ResponseEntity<List<CommentResponse>> getActivityComments(
            @PathVariable Long id,
            Authentication authentication) {
        
        Long currentUserId = null;
        if (authentication != null) {
            currentUserId = Long.parseLong(authentication.getName());
        }
        
        List<CommentResponse> comments = activityCommentService.getActivityComments(id, currentUserId);
        return ResponseEntity.ok(comments);
    }
    
    @PostMapping("/comments/{id}/reactions")
    public ResponseEntity<?> addOrUpdateCommentReaction(
            @PathVariable Long id,
            @RequestBody ReactionRequest request,
            Authentication authentication) {
        
        Long participantId = Long.parseLong(authentication.getName());
        activityCommentService.addOrUpdateCommentReaction(id, participantId, request.getReactionType());
        
        return ResponseEntity.ok(new MessageResponse("Reaction added successfully"));
    }
    
    @DeleteMapping("/comments/{id}/reactions")
    public ResponseEntity<?> removeCommentReaction(
            @PathVariable Long id,
            Authentication authentication) {
        
        Long participantId = Long.parseLong(authentication.getName());
        activityCommentService.removeCommentReaction(id, participantId);
        
        return ResponseEntity.ok(new MessageResponse("Reaction removed successfully"));
    }
}
