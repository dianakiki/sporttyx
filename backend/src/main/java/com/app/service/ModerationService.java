package com.app.service;

import com.app.dto.ActivityModerationResponse;
import com.app.dto.BonusTypeResponse;
import com.app.dto.ModerationStatsResponse;
import com.app.dto.ParticipantSimpleDto;
import com.app.model.*;
import com.app.repository.ActivityAdjustmentRepository;
import com.app.repository.ActivityParticipantRepository;
import com.app.repository.ActivityRepository;
import com.app.repository.BonusTypeRepository;
import com.app.repository.EventRepository;
import com.app.repository.ParticipantRepository;
import com.app.repository.TeamParticipantRepository;
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
    
    @Autowired
    private EventRepository eventRepository;
    
    @Autowired
    private BonusTypeRepository bonusTypeRepository;
    
    @Autowired
    private ActivityAdjustmentRepository activityAdjustmentRepository;
    
    @Autowired
    private ActivityParticipantRepository activityParticipantRepository;
    
    @Autowired
    private TeamParticipantRepository teamParticipantRepository;
    
    @Autowired
    private NotificationService notificationService;
    
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
        approveActivityWithBonus(activityId, moderatorId, null, null);
    }
    
    @Transactional
    public void approveActivityWithBonus(Long activityId, Long moderatorId, Long bonusTypeId, String comment) {
        approveActivityWithAdjustment(activityId, moderatorId, bonusTypeId, null, comment);
    }
    
    @Transactional
    public void approveActivityWithAdjustment(Long activityId, Long moderatorId, Long bonusTypeId, Long penaltyTypeId, String comment) {
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
        
        // Apply bonus if specified
        BonusType bonusType = null;
        if (bonusTypeId != null) {
            bonusType = bonusTypeRepository.findById(bonusTypeId)
                    .orElseThrow(() -> new RuntimeException("Bonus type not found"));
            
            ActivityAdjustment adjustment = new ActivityAdjustment();
            adjustment.setActivity(activity);
            adjustment.setBonusType(bonusType);
            adjustment.setModerator(moderator);
            adjustment.setPointsAdjustment(bonusType.getPointsAdjustment());
            adjustment.setComment(comment);
            
            activityAdjustmentRepository.save(adjustment);
        }
        
        // Apply penalty if specified (to approved activity)
        BonusType penaltyType = null;
        if (penaltyTypeId != null) {
            penaltyType = bonusTypeRepository.findById(penaltyTypeId)
                    .orElseThrow(() -> new RuntimeException("Penalty type not found"));
            
            ActivityAdjustment adjustment = new ActivityAdjustment();
            adjustment.setActivity(activity);
            adjustment.setBonusType(penaltyType);
            adjustment.setModerator(moderator);
            adjustment.setPointsAdjustment(penaltyType.getPointsAdjustment());
            adjustment.setComment(comment);
            
            activityAdjustmentRepository.save(adjustment);
        }
        
        // Create notification for participant with bonus/penalty and comment info
        BonusType adjustmentType = bonusType != null ? bonusType : penaltyType;
        notificationService.createActivityApprovedNotification(activity, moderator, adjustmentType, comment);
    }
    
    @Transactional
    public void rejectActivity(Long activityId, Long moderatorId, String reason) {
        rejectActivityWithPenalty(activityId, moderatorId, reason, null);
    }
    
    @Transactional
    public void rejectActivityWithPenalty(Long activityId, Long moderatorId, String reason, Long penaltyTypeId) {
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
        
        // Apply penalty if specified
        BonusType penaltyType = null;
        if (penaltyTypeId != null) {
            penaltyType = bonusTypeRepository.findById(penaltyTypeId)
                    .orElseThrow(() -> new RuntimeException("Penalty type not found"));
            
            ActivityAdjustment adjustment = new ActivityAdjustment();
            adjustment.setActivity(activity);
            adjustment.setBonusType(penaltyType);
            adjustment.setModerator(moderator);
            adjustment.setPointsAdjustment(penaltyType.getPointsAdjustment());
            adjustment.setComment(reason);
            
            activityAdjustmentRepository.save(adjustment);
        }
        
        // Create notification for participant with penalty info
        notificationService.createActivityRejectedNotification(activity, moderator, reason, penaltyType);
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
        
        // Get all participants involved in this activity
        List<ParticipantSimpleDto> participants = activity.getActivityParticipants().stream()
                .map(ap -> new ParticipantSimpleDto(
                        ap.getParticipant().getId(),
                        ap.getParticipant().getName(),
                        ap.getParticipant().getProfileImageUrl()
                ))
                .collect(Collectors.toList());
        
        // If no participants are explicitly set, use the main participant (author)
        if (participants.isEmpty()) {
            participants.add(new ParticipantSimpleDto(
                    activity.getParticipant().getId(),
                    activity.getParticipant().getName(),
                    activity.getParticipant().getProfileImageUrl()
            ));
        }
        
        // Get total team participants count
        int totalTeamParticipants = teamParticipantRepository.findByTeamId(activity.getTeam().getId()).size();
        
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
                activity.getCreatedAt(),
                participants,
                totalTeamParticipants
        );
    }
    
    public boolean hasModerationEnabledEvents() {
        return eventRepository.findAll().stream()
                .anyMatch(Event::getRequiresActivityApproval);
    }
    
    public List<BonusTypeResponse> getBonusTypesByEvent(Long eventId) {
        return bonusTypeRepository.findByEventIdAndIsActiveTrue(eventId).stream()
                .map(bt -> new BonusTypeResponse(
                        bt.getId(),
                        bt.getName(),
                        bt.getDescription(),
                        bt.getPointsAdjustment(),
                        bt.getType().name()
                ))
                .collect(Collectors.toList());
    }
}
