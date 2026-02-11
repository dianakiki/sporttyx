package com.app.repository;

import com.app.model.Activity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface ActivityRepository extends JpaRepository<Activity, Long> {
    List<Activity> findByTeamIdOrderByCreatedAtDesc(Long teamId);
    
    List<Activity> findByParticipantIdOrderByCreatedAtDesc(Long participantId);
    
    List<Activity> findByTeamIdAndCreatedAtAfter(Long teamId, LocalDateTime createdAt);
}
