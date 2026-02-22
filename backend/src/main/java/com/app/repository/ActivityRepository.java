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
    
    @Query("SELECT SUM(a.energy) FROM Activity a WHERE a.team.id = :teamId AND a.status IN :statuses")
    Integer sumEnergyByTeamIdAndStatusIn(@Param("teamId") Long teamId, @Param("statuses") List<ActivityStatus> statuses);
}
