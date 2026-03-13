package com.app.repository;

import com.app.model.Activity;
import com.app.model.ActivityStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface ActivityRepository extends JpaRepository<Activity, Long>, JpaSpecificationExecutor<Activity> {
    List<Activity> findByTeamIdOrderByCreatedAtDesc(Long teamId);
    
    List<Activity> findByParticipantIdOrderByCreatedAtDesc(Long participantId);
    
    List<Activity> findByTeamIdAndCreatedAtAfter(Long teamId, LocalDateTime createdAt);
    
    List<Activity> findByTeamIdAndStatusInOrderByCreatedAtDesc(Long teamId, List<ActivityStatus> statuses);
    
    long countByStatus(ActivityStatus status);
    
    long countByModeratedByIdAndStatus(Long moderatorId, ActivityStatus status);
    
    @Query("SELECT COALESCE(SUM(a.points), 0) FROM Activity a WHERE a.team.id = :teamId AND a.status IN :statuses")
    Integer sumEnergyByTeamIdAndStatusIn(@Param("teamId") Long teamId, @Param("statuses") List<ActivityStatus> statuses);
    
    @Query("SELECT DISTINCT a FROM Activity a LEFT JOIN FETCH a.adjustments adj LEFT JOIN FETCH adj.bonusType WHERE a.id = :id")
    Activity findByIdWithAdjustments(@Param("id") Long id);
    
    @Query("SELECT DISTINCT a FROM Activity a LEFT JOIN FETCH a.adjustments adj LEFT JOIN FETCH adj.bonusType WHERE a.status IN :statuses ORDER BY a.createdAt DESC")
    List<Activity> findAllWithAdjustmentsByStatusIn(@Param("statuses") List<ActivityStatus> statuses);
    
    @Query("SELECT DISTINCT a FROM Activity a LEFT JOIN FETCH a.adjustments adj LEFT JOIN FETCH adj.bonusType WHERE a.team.id = :teamId AND a.status IN :statuses ORDER BY a.createdAt DESC")
    List<Activity> findByTeamIdWithAdjustments(@Param("teamId") Long teamId, @Param("statuses") List<ActivityStatus> statuses);
    
    @Query("SELECT DISTINCT a FROM Activity a " +
           "LEFT JOIN FETCH a.adjustments adj LEFT JOIN FETCH adj.bonusType " +
           "LEFT JOIN FETCH a.team t LEFT JOIN FETCH t.event " +
           "LEFT JOIN FETCH a.activityType at LEFT JOIN FETCH at.event " +
           "WHERE (" +
           "  (a.team IS NOT NULL AND a.team.event IS NOT NULL AND a.team.event.id = :eventId) OR " +
           "  (a.team IS NULL AND a.activityType.event IS NOT NULL AND a.activityType.event.id = :eventId)" +
           ") " +
           "AND a.status IN :statuses ORDER BY a.createdAt DESC")
    List<Activity> findByEventIdWithAdjustments(@Param("eventId") Long eventId, @Param("statuses") List<ActivityStatus> statuses);
    
    @Query("SELECT DISTINCT a FROM Activity a " +
           "LEFT JOIN FETCH a.adjustments adj LEFT JOIN FETCH adj.bonusType " +
           "LEFT JOIN FETCH a.team t LEFT JOIN FETCH t.event " +
           "LEFT JOIN FETCH a.activityType at LEFT JOIN FETCH at.event " +
           "WHERE a.participant.id = :participantId " +
           "AND (" +
           "  (a.team IS NOT NULL AND a.team.event IS NOT NULL AND a.team.event.id = :eventId) OR " +
           "  (a.team IS NULL AND a.activityType.event IS NOT NULL AND a.activityType.event.id = :eventId)" +
           ") " +
           "AND a.status IN :statuses ORDER BY a.createdAt DESC")
    List<Activity> findByParticipantIdAndEventIdWithAdjustments(
        @Param("participantId") Long participantId, 
        @Param("eventId") Long eventId, 
        @Param("statuses") List<ActivityStatus> statuses
    );
}
