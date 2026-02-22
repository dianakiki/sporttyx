package com.app.controller;

import com.app.dto.ActivityModerationResponse;
import com.app.dto.ModerationStatsResponse;
import com.app.dto.RejectActivityRequest;
import com.app.service.ModerationService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/moderation")
@CrossOrigin(origins = "http://localhost:3000")
public class ModerationController {
    
    @Autowired
    private ModerationService moderationService;
    
    @GetMapping("/activities/pending")
    @PreAuthorize("hasAnyRole('MODERATOR', 'ADMIN')")
    public ResponseEntity<List<ActivityModerationResponse>> getPendingActivities(
            @RequestParam(required = false) Long eventId,
            @RequestParam(required = false) Long teamId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size,
            @AuthenticationPrincipal UserDetails userDetails
    ) {
        List<ActivityModerationResponse> activities = moderationService.getPendingActivities(
                eventId, teamId, page, size);
        return ResponseEntity.ok(activities);
    }
    
    @PostMapping("/activities/{id}/approve")
    @PreAuthorize("hasAnyRole('MODERATOR', 'ADMIN')")
    public ResponseEntity<Void> approveActivity(
            @PathVariable Long id,
            @AuthenticationPrincipal UserDetails userDetails
    ) {
        Long moderatorId = Long.parseLong(userDetails.getUsername());
        moderationService.approveActivity(id, moderatorId);
        return ResponseEntity.ok().build();
    }
    
    @PostMapping("/activities/{id}/reject")
    @PreAuthorize("hasAnyRole('MODERATOR', 'ADMIN')")
    public ResponseEntity<Void> rejectActivity(
            @PathVariable Long id,
            @RequestBody RejectActivityRequest request,
            @AuthenticationPrincipal UserDetails userDetails
    ) {
        Long moderatorId = Long.parseLong(userDetails.getUsername());
        moderationService.rejectActivity(id, moderatorId, request.getReason());
        return ResponseEntity.ok().build();
    }
    
    @GetMapping("/stats")
    @PreAuthorize("hasAnyRole('MODERATOR', 'ADMIN')")
    public ResponseEntity<ModerationStatsResponse> getStats(
            @AuthenticationPrincipal UserDetails userDetails
    ) {
        Long moderatorId = Long.parseLong(userDetails.getUsername());
        ModerationStatsResponse stats = moderationService.getModerationStats(moderatorId);
        return ResponseEntity.ok(stats);
    }
}
