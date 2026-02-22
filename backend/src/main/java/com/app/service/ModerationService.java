package com.app.service;

import com.app.dto.ActivityModerationResponse;
import com.app.dto.ModerationStatsResponse;
import com.app.model.*;
import com.app.repository.ActivityRepository;
import com.app.repository.ParticipantRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import javax.persistence.criteria.Predicate;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class ModerationService {
    
    @Autowired
    private ActivityRepository activityRepository;
    
    @Autowired
    private ParticipantRepository participantRepository;
    
    public List<ActivityModerationResponse> getPendingActivities(
            Long eventId, 
            Long teamId,
            int page, 
            int size
    ) {
        Pageable pageable = PageRequest.of(page, size, Sort.by("createdAt").descending());
        
        Specification<Activity> spec = (root, query, cb) -> {
            List<Predicate> predicates = new ArrayList<>();
            predicates.add(cb.equal(root.get("status"), ActivityStatus.PENDING));
            
            if (eventId != null) {
                predicates.add(cb.equal(root.get("team").get("event").get("id"), eventId));
            }
            if (teamId != null) {
                predicates.add(cb.equal(root.get("team").get("id"), teamId));
            }
            
            return cb.and(predicates.toArray(new Predicate[0]));
        };
        
        return activityRepository.findAll(spec, pageable)
                .map(this::toModerationResponse)
                .getContent();
    }
    
    @Transactional
    public void approveActivity(Long activityId, Long moderatorId) {
        Activity activity = activityRepository.findById(activityId)
                .orElseThrow(() -> new RuntimeException("Activity not found"));
        
        if (activity.getStatus() != ActivityStatus.PENDING) {
            throw new RuntimeException("Activity is not pending moderation");
        }
        
        Participant moderator = participantRepository.findById(moderatorId)
                .orElseThrow(() -> new RuntimeException("Moderator not found"));
        
        if (moderator.getRole() != Role.MODERATOR && moderator.getRole() != Role.ADMIN) {
            throw new RuntimeException("User is not a moderator");
        }
        
        activity.setStatus(ActivityStatus.APPROVED);
        activity.setModeratedBy(moderator);
        activity.setModeratedAt(LocalDateTime.now());
        activity.setRejectionReason(null);
        
        activityRepository.save(activity);
    }
    
    @Transactional
    public void rejectActivity(Long activityId, Long moderatorId, String reason) {
        Activity activity = activityRepository.findById(activityId)
                .orElseThrow(() -> new RuntimeException("Activity not found"));
        
        if (activity.getStatus() != ActivityStatus.PENDING) {
            throw new RuntimeException("Activity is not pending moderation");
        }
        
        Participant moderator = participantRepository.findById(moderatorId)
                .orElseThrow(() -> new RuntimeException("Moderator not found"));
        
        if (moderator.getRole() != Role.MODERATOR && moderator.getRole() != Role.ADMIN) {
            throw new RuntimeException("User is not a moderator");
        }
        
        activity.setStatus(ActivityStatus.REJECTED);
        activity.setModeratedBy(moderator);
        activity.setModeratedAt(LocalDateTime.now());
        activity.setRejectionReason(reason);
        
        activityRepository.save(activity);
    }
    
    public ModerationStatsResponse getModerationStats(Long moderatorId) {
        long pendingCount = activityRepository.countByStatus(ActivityStatus.PENDING);
        
        long approvedByModerator = activityRepository.countByModeratedByIdAndStatus(
                moderatorId, ActivityStatus.APPROVED);
        long rejectedByModerator = activityRepository.countByModeratedByIdAndStatus(
                moderatorId, ActivityStatus.REJECTED);
        
        return new ModerationStatsResponse(
                pendingCount,
                approvedByModerator,
                rejectedByModerator
        );
    }
    
    private ActivityModerationResponse toModerationResponse(Activity activity) {
        List<String> photoUrls = activity.getPhotos().stream()
                .map(ActivityPhoto::getPhotoUrl)
                .collect(Collectors.toList());
        
        return new ActivityModerationResponse(
                activity.getId(),
                activity.getActivityType().getName(),
                activity.getEnergy(),
                activity.getParticipant().getName(),
                activity.getParticipant().getId(),
                activity.getTeam().getName(),
                activity.getTeam().getId(),
                activity.getTeam().getEvent() != null ? activity.getTeam().getEvent().getName() : null,
                activity.getTeam().getEvent() != null ? activity.getTeam().getEvent().getId() : null,
                photoUrls,
                activity.getStatus(),
                activity.getCreatedAt()
        );
    }
}
