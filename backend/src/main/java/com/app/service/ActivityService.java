package com.app.service;

import com.app.dto.ActivityHeatmapResponse;
import com.app.dto.ActivityResponse;
import com.app.dto.CreateActivityResponse;
import com.app.model.Activity;
import com.app.model.ActivityPhoto;
import com.app.model.ActivityStatus;
import com.app.model.ActivityType;
import com.app.model.Event;
import com.app.model.Participant;
import com.app.model.Team;
import com.app.repository.ActivityPhotoRepository;
import com.app.repository.ActivityRepository;
import com.app.repository.ActivityTypeRepository;
import com.app.repository.ParticipantRepository;
import com.app.repository.TeamRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.time.LocalDateTime;
import java.util.Comparator;
import java.util.List;
import java.util.Map;
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
    
    @Autowired
    private ImageService imageService;
    
    @Autowired
    private ActivityPhotoRepository activityPhotoRepository;
    
    @Autowired
    private ActivityReactionService activityReactionService;
    
    @Autowired
    private ActivityCommentService activityCommentService;
    
    public List<ActivityResponse> getTeamActivities(Long teamId) {
        return activityRepository.findByTeamIdOrderByCreatedAtDesc(teamId).stream()
                .map(a -> toActivityResponse(a, null))
                .collect(Collectors.toList());
    }
    
    public List<ActivityResponse> getAllActivities() {
        return activityRepository.findAll().stream()
                .sorted(Comparator.comparing(Activity::getCreatedAt).reversed())
                .map(a -> toActivityResponse(a, null))
                .collect(Collectors.toList());
    }
    
    public ActivityResponse getActivityById(Long id) {
        Activity a = activityRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Activity not found"));
        
        return toActivityResponse(a, null);
    }
    
    public CreateActivityResponse createActivity(Long teamId, Long participantId, String type, 
                                                  Integer energy, List<MultipartFile> photos) {
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
        
        Event event = team.getEvent();
        if (event != null && event.getRequiresActivityApproval()) {
            activity.setStatus(ActivityStatus.PENDING);
        } else {
            activity.setStatus(ActivityStatus.AUTO_APPROVED);
        }
        
        activity = activityRepository.save(activity);
        
        if (photos != null && !photos.isEmpty()) {
            int order = 0;
            for (MultipartFile photo : photos) {
                if (photo != null && !photo.isEmpty()) {
                    try {
                        String photoUrl = imageService.saveActivityImage(photo);
                        
                        ActivityPhoto activityPhoto = new ActivityPhoto();
                        activityPhoto.setActivity(activity);
                        activityPhoto.setPhotoUrl(photoUrl);
                        activityPhoto.setDisplayOrder(order++);
                        activityPhotoRepository.save(activityPhoto);
                        
                        if (activity.getPhotoUrl() == null) {
                            activity.setPhotoUrl(photoUrl);
                        }
                    } catch (IOException e) {
                        throw new RuntimeException("Failed to save activity photo", e);
                    }
                }
            }
            activityRepository.save(activity);
        }
        
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
    
    private ActivityResponse toActivityResponse(Activity a, Long currentUserId) {
        List<String> photoUrls = a.getPhotos().stream()
                .map(ActivityPhoto::getPhotoUrl)
                .collect(Collectors.toList());
        
        Boolean teamBased = a.getTeam() != null && a.getTeam().getEvent() != null 
                ? a.getTeam().getEvent().getTeamBasedCompetition() 
                : true;
        
        Map<String, Integer> reactionCounts = activityReactionService.getReactionCounts(a.getId());
        String userReaction = null;
        if (currentUserId != null) {
            var reactionResponse = activityReactionService.getActivityReactions(a.getId(), currentUserId);
            userReaction = reactionResponse.getUserReaction();
        }
        Integer totalReactions = activityReactionService.getTotalReactions(a.getId());
        Long commentCountLong = activityCommentService.getCommentCount(a.getId());
        Integer commentCount = commentCountLong != null ? commentCountLong.intValue() : 0;
        
        ActivityResponse response = new ActivityResponse(
                a.getId(),
                a.getActivityType().getName(),
                a.getEnergy(),
                a.getParticipant().getName(),
                a.getPhotoUrl(),
                photoUrls,
                a.getCreatedAt(),
                a.getTeam() != null ? a.getTeam().getId() : null,
                a.getTeam() != null ? a.getTeam().getName() : null,
                teamBased,
                reactionCounts,
                userReaction,
                totalReactions,
                commentCount
        );
        
        return response;
    }
}
