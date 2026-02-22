package com.app.repository;

import com.app.model.ActivityReaction;
import com.app.model.ReactionType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Map;
import java.util.Optional;

@Repository
public interface ActivityReactionRepository extends JpaRepository<ActivityReaction, Long> {
    Optional<ActivityReaction> findByActivityIdAndParticipantId(Long activityId, Long participantId);
    
    List<ActivityReaction> findByActivityId(Long activityId);
    
    void deleteByActivityIdAndParticipantId(Long activityId, Long participantId);
    
    @Query("SELECT ar.reactionType, COUNT(ar) FROM ActivityReaction ar WHERE ar.activity.id = :activityId GROUP BY ar.reactionType")
    List<Object[]> countReactionsByActivityId(@Param("activityId") Long activityId);
    
    @Query("SELECT COUNT(ar) FROM ActivityReaction ar WHERE ar.activity.id = :activityId")
    Long countByActivityId(@Param("activityId") Long activityId);
}
