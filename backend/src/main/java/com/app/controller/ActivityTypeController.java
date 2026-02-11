package com.app.controller;

import com.app.dto.ActivityTypeResponse;
import com.app.dto.CreateActivityTypeRequest;
import com.app.service.ActivityTypeService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/activity-types")
public class ActivityTypeController {
    
    @Autowired
    private ActivityTypeService activityTypeService;
    
    @GetMapping
    public ResponseEntity<List<ActivityTypeResponse>> getAllActivityTypes() {
        return ResponseEntity.ok(activityTypeService.getAllActivityTypes());
    }
    
    @GetMapping("/{id}")
    public ResponseEntity<ActivityTypeResponse> getActivityTypeById(@PathVariable Long id) {
        return ResponseEntity.ok(activityTypeService.getActivityTypeById(id));
    }
    
    @PostMapping
    public ResponseEntity<ActivityTypeResponse> createActivityType(@RequestBody CreateActivityTypeRequest request) {
        return ResponseEntity.ok(activityTypeService.createActivityType(request));
    }
    
    @PutMapping("/{id}")
    public ResponseEntity<ActivityTypeResponse> updateActivityType(
            @PathVariable Long id,
            @RequestBody CreateActivityTypeRequest request) {
        return ResponseEntity.ok(activityTypeService.updateActivityType(id, request));
    }
    
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteActivityType(@PathVariable Long id) {
        activityTypeService.deleteActivityType(id);
        return ResponseEntity.ok().build();
    }
}
