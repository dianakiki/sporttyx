package com.app.service;

import com.app.dto.ActivityTypeResponse;
import com.app.dto.CreateActivityTypeRequest;
import com.app.model.ActivityType;
import com.app.model.Event;
import com.app.repository.ActivityTypeRepository;
import com.app.repository.EventRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class ActivityTypeService {
    
    @Autowired
    private ActivityTypeRepository activityTypeRepository;
    
    @Autowired
    private EventRepository eventRepository;
    
    public List<ActivityTypeResponse> getAllActivityTypes() {
        return activityTypeRepository.findAllByOrderByNameAsc().stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
    }
    
    public List<ActivityTypeResponse> getActivityTypesByEventId(Long eventId) {
        return activityTypeRepository.findByEventIdOrderByNameAsc(eventId).stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
    }
    
    public ActivityTypeResponse getActivityTypeById(Long id) {
        ActivityType activityType = activityTypeRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Activity type not found"));
        return toResponse(activityType);
    }
    
    public ActivityTypeResponse createActivityType(CreateActivityTypeRequest request) {
        if (activityTypeRepository.findByName(request.getName()).isPresent()) {
            throw new RuntimeException("Activity type with this name already exists");
        }
        
        ActivityType activityType = new ActivityType();
        activityType.setName(request.getName());
        activityType.setDescription(request.getDescription());
        activityType.setDefaultEnergy(request.getDefaultEnergy());
        
        if (request.getEventId() != null) {
            Event event = eventRepository.findById(request.getEventId())
                    .orElseThrow(() -> new RuntimeException("Event not found"));
            activityType.setEvent(event);
        }
        
        activityType = activityTypeRepository.save(activityType);
        return toResponse(activityType);
    }
    
    public ActivityTypeResponse updateActivityType(Long id, CreateActivityTypeRequest request) {
        ActivityType activityType = activityTypeRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Activity type not found"));
        
        activityType.setName(request.getName());
        activityType.setDescription(request.getDescription());
        activityType.setDefaultEnergy(request.getDefaultEnergy());
        
        activityType = activityTypeRepository.save(activityType);
        return toResponse(activityType);
    }
    
    public void deleteActivityType(Long id) {
        activityTypeRepository.deleteById(id);
    }
    
    private ActivityTypeResponse toResponse(ActivityType activityType) {
        return new ActivityTypeResponse(
                activityType.getId(),
                activityType.getName(),
                activityType.getDescription(),
                activityType.getDefaultEnergy()
        );
    }
}
