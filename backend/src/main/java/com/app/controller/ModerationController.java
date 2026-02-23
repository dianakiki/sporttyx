package com.app.controller;

import com.app.dto.ActivityModerationResponse;
import com.app.dto.BonusTypeResponse;
import com.app.dto.ModerationStatsResponse;
import com.app.dto.RejectActivityRequest;
import com.app.model.Participant;
import com.app.repository.ParticipantRepository;
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
    
    @Autowired
    private ParticipantRepository participantRepository;
    
    @GetMapping("/enabled")
    @PreAuthorize("hasAnyRole('MODERATOR', 'ADMIN')")
    public ResponseEntity<Boolean> isModerationEnabled() {
        boolean enabled = moderationService.hasModerationEnabledEvents();
        return ResponseEntity.ok(enabled);
    }
    
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
            @RequestParam(required = false) Long bonusTypeId,
            @RequestParam(required = false) Long penaltyTypeId,
            @RequestParam(required = false) String comment,
            @AuthenticationPrincipal UserDetails userDetails
    ) {
        Participant moderator = participantRepository.findByUsername(userDetails.getUsername())
                .orElseThrow(() -> new RuntimeException("Moderator not found"));
        moderationService.approveActivityWithAdjustment(id, moderator.getId(), bonusTypeId, penaltyTypeId, comment);
        return ResponseEntity.ok().build();
    }
    
    @PostMapping("/activities/{id}/reject")
    @PreAuthorize("hasAnyRole('MODERATOR', 'ADMIN')")
    public ResponseEntity<Void> rejectActivity(
            @PathVariable Long id,
            @RequestParam(required = false) Long penaltyTypeId,
            @RequestBody RejectActivityRequest request,
            @AuthenticationPrincipal UserDetails userDetails
    ) {
        Participant moderator = participantRepository.findByUsername(userDetails.getUsername())
                .orElseThrow(() -> new RuntimeException("Moderator not found"));
        moderationService.rejectActivityWithPenalty(id, moderator.getId(), request.getReason(), penaltyTypeId);
        return ResponseEntity.ok().build();
    }
    
    @GetMapping("/stats")
    @PreAuthorize("hasAnyRole('MODERATOR', 'ADMIN')")
    public ResponseEntity<ModerationStatsResponse> getStats(
            @AuthenticationPrincipal UserDetails userDetails
    ) {
        Participant moderator = participantRepository.findByUsername(userDetails.getUsername())
                .orElseThrow(() -> new RuntimeException("Moderator not found"));
        ModerationStatsResponse stats = moderationService.getModerationStats(moderator.getId());
        return ResponseEntity.ok(stats);
    }
    
    @GetMapping("/bonus-types")
    @PreAuthorize("hasAnyRole('MODERATOR', 'ADMIN')")
    public ResponseEntity<List<BonusTypeResponse>> getBonusTypes(
            @RequestParam Long eventId
    ) {
        List<BonusTypeResponse> bonusTypes = moderationService.getBonusTypesByEvent(eventId);
        return ResponseEntity.ok(bonusTypes);
    }
}
