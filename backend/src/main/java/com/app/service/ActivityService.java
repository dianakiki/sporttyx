package com.app.service;

import com.app.dto.ActivityHeatmapResponse;
import com.app.dto.ActivityResponse;
import com.app.dto.CreateActivityResponse;
import com.app.model.Activity;
import com.app.model.ActivityType;
import com.app.model.Participant;
import com.app.model.Team;
import com.app.repository.ActivityRepository;
import com.app.repository.ActivityTypeRepository;
import com.app.repository.ParticipantRepository;
import com.app.repository.TeamRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.time.LocalDateTime;
import java.util.Comparator;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
public class ActivityService {
    
    @Autowired
    private ActivityRepository activityRepository;
    
    @Autowired
    private TeamRepository teamRepository;
    
    @Autowired
    private ParticipantRepository participantRepository;
    
    @Autowired
    private ActivityTypeRepository activityTypeRepository;
    
    private static final String UPLOAD_DIR = "uploads/activities/";
    
    public List<ActivityResponse> getTeamActivities(Long teamId) {
        return activityRepository.findByTeamIdOrderByCreatedAtDesc(teamId).stream()
                .map(a -> new ActivityResponse(
                        a.getId(),
                        a.getActivityType().getName(),
                        a.getEnergy(),
                        a.getParticipant().getName(),
                        a.getPhotoUrl(),
                        a.getCreatedAt()
                ))
                .collect(Collectors.toList());
    }
    
    public List<ActivityResponse> getAllActivities() {
        return activityRepository.findAll().stream()
                .sorted(Comparator.comparing(Activity::getCreatedAt).reversed())
                .map(a -> new ActivityResponse(
                        a.getId(),
                        a.getActivityType().getName(),
                        a.getEnergy(),
                        a.getParticipant().getName(),
                        a.getPhotoUrl(),
                        a.getCreatedAt()
                ))
                .collect(Collectors.toList());
    }
    
    public CreateActivityResponse createActivity(Long teamId, Long participantId, String type, 
                                                  Integer energy, MultipartFile photo) {
        Team team = teamRepository.findById(teamId)
                .orElseThrow(() -> new RuntimeException("Team not found"));
        
        Participant participant = participantRepository.findById(participantId)
                .orElseThrow(() -> new RuntimeException("Participant not found"));
        
        ActivityType activityType = activityTypeRepository.findByName(type)
                .orElseThrow(() -> new RuntimeException("Activity type not found: " + type));
        
        Activity activity = new Activity();
        activity.setTeam(team);
        activity.setParticipant(participant);
        activity.setActivityType(activityType);
        activity.setEnergy(energy);
        
        if (photo != null && !photo.isEmpty()) {
            String photoUrl = savePhoto(photo);
            activity.setPhotoUrl(photoUrl);
        }
        
        activity = activityRepository.save(activity);
        
        return new CreateActivityResponse(
                activity.getId(),
                activity.getActivityType().getName(),
                activity.getEnergy(),
                activity.getCreatedAt()
        );
    }
    
    public List<ActivityHeatmapResponse> getTeamActivityHeatmap(Long teamId) {
        LocalDateTime threeMonthsAgo = LocalDateTime.now().minusDays(90);
        List<Activity> activities = activityRepository.findByTeamIdAndCreatedAtAfter(teamId, threeMonthsAgo);
        
        // Group activities by date
        Map<String, Integer> activityCountByDate = activities.stream()
                .collect(Collectors.groupingBy(
                        a -> a.getCreatedAt().toLocalDate().toString(),
                        Collectors.summingInt(a -> 1)
                ));
        
        // Convert to response list
        return activityCountByDate.entrySet().stream()
                .map(entry -> new ActivityHeatmapResponse(entry.getKey(), entry.getValue()))
                .sorted(Comparator.comparing(ActivityHeatmapResponse::getDate))
                .collect(Collectors.toList());
    }
    
    private String savePhoto(MultipartFile photo) {
        try {
            Path uploadPath = Paths.get(UPLOAD_DIR);
            if (!Files.exists(uploadPath)) {
                Files.createDirectories(uploadPath);
            }
            
            String filename = UUID.randomUUID().toString() + "_" + photo.getOriginalFilename();
            Path filePath = uploadPath.resolve(filename);
            Files.copy(photo.getInputStream(), filePath);
            
            return "/uploads/activities/" + filename;
        } catch (IOException e) {
            throw new RuntimeException("Failed to save photo", e);
        }
    }
}
