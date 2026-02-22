package com.app.service;

import com.app.dto.ActivityReactionResponse;
import com.app.model.Activity;
import com.app.model.ActivityReaction;
import com.app.model.Participant;
import com.app.model.ReactionType;
import com.app.repository.ActivityReactionRepository;
import com.app.repository.ActivityRepository;
import com.app.repository.ParticipantRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;

@Service
public class ActivityReactionService {
    
    @Autowired
    private ActivityReactionRepository activityReactionRepository;
    
    @Autowired
    private ActivityRepository activityRepository;
    
    @Autowired
    private ParticipantRepository participantRepository;
    
    @Transactional
    public void addOrUpdateReaction(Long activityId, Long participantId, ReactionType reactionType) {
        Activity activity = activityRepository.findById(activityId)
                .orElseThrow(() -> new RuntimeException("Activity not found"));
        
        Participant participant = participantRepository.findById(participantId)
                .orElseThrow(() -> new RuntimeException("Participant not found"));
        
        Optional<ActivityReaction> existingReaction = 
                activityReactionRepository.findByActivityIdAndParticipantId(activityId, participantId);
        
        if (existingReaction.isPresent()) {
            ActivityReaction reaction = existingReaction.get();
            reaction.setReactionType(reactionType);
            activityReactionRepository.save(reaction);
        } else {
            ActivityReaction reaction = new ActivityReaction();
            reaction.setActivity(activity);
            reaction.setParticipant(participant);
            reaction.setReactionType(reactionType);
            activityReactionRepository.save(reaction);
        }
    }
    
    @Transactional
    public void removeReaction(Long activityId, Long participantId) {
        activityReactionRepository.deleteByActivityIdAndParticipantId(activityId, participantId);
    }
    
    public ActivityReactionResponse getActivityReactions(Long activityId, Long currentUserId) {
        Map<String, Integer> reactionCounts = getReactionCounts(activityId);
        
        String userReaction = null;
        if (currentUserId != null) {
            Optional<ActivityReaction> userReactionOpt = 
                    activityReactionRepository.findByActivityIdAndParticipantId(activityId, currentUserId);
            if (userReactionOpt.isPresent()) {
                userReaction = userReactionOpt.get().getReactionType().name();
            }
        }
        
        return new ActivityReactionResponse(reactionCounts, userReaction);
    }
    
    public Map<String, Integer> getReactionCounts(Long activityId) {
        List<Object[]> results = activityReactionRepository.countReactionsByActivityId(activityId);
        Map<String, Integer> counts = new HashMap<>();
        
        for (Object[] result : results) {
            ReactionType type = (ReactionType) result[0];
            Long count = (Long) result[1];
            counts.put(type.name(), count.intValue());
        }
        
        return counts;
    }
    
    public Integer getTotalReactions(Long activityId) {
        Long count = activityReactionRepository.countByActivityId(activityId);
        return count != null ? count.intValue() : 0;
    }
}
