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
    
    /**
     * Получить все типы активностей или типы для конкретного события
     */
    @GetMapping
    public ResponseEntity<List<ActivityTypeResponse>> getAllActivityTypes(
            @RequestParam(required = false) Long eventId) {
        if (eventId != null) {
            return ResponseEntity.ok(activityTypeService.getActivityTypesByEventId(eventId));
        }
        return ResponseEntity.ok(activityTypeService.getAllActivityTypes());
    }
    
    /**
     * Получить тип активности по ID
     */
    @GetMapping("/{id}")
    public ResponseEntity<ActivityTypeResponse> getActivityTypeById(@PathVariable Long id) {
        return ResponseEntity.ok(activityTypeService.getActivityTypeById(id));
    }
    
    /**
     * Создать новый тип активности
     */
    @PostMapping
    public ResponseEntity<ActivityTypeResponse> createActivityType(@RequestBody CreateActivityTypeRequest request) {
        return ResponseEntity.ok(activityTypeService.createActivityType(request));
    }
    
    /**
     * Обновить существующий тип активности
     */
    @PutMapping("/{id}")
    public ResponseEntity<ActivityTypeResponse> updateActivityType(
            @PathVariable Long id,
            @RequestBody CreateActivityTypeRequest request) {
        return ResponseEntity.ok(activityTypeService.updateActivityType(id, request));
    }
    
    /**
     * Удалить тип активности
     */
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteActivityType(@PathVariable Long id) {
        activityTypeService.deleteActivityType(id);
        return ResponseEntity.ok().build();
    }
}
