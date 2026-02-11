package com.app.controller;

import com.app.dto.ActivityResponse;
import com.app.dto.CreateActivityResponse;
import com.app.service.ActivityService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

@RestController
@RequestMapping("/api")
@CrossOrigin(origins = "http://localhost:3000")
public class ActivityController {
    
    @Autowired
    private ActivityService activityService;
    
    @GetMapping("/teams/{teamId}/activities")
    public ResponseEntity<List<ActivityResponse>> getTeamActivities(@PathVariable Long teamId) {
        List<ActivityResponse> activities = activityService.getTeamActivities(teamId);
        return ResponseEntity.ok(activities);
    }
    
    @PostMapping("/activities")
    public ResponseEntity<CreateActivityResponse> createActivity(
            @RequestParam Long teamId,
            @RequestParam Long participantId,
            @RequestParam String type,
            @RequestParam Integer energy,
            @RequestParam(required = false) MultipartFile photo) {
        CreateActivityResponse response = activityService.createActivity(
                teamId, participantId, type, energy, photo);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }
}
