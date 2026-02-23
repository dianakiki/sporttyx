package com.app.repository;

import com.app.model.ActivityComment;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ActivityCommentRepository extends JpaRepository<ActivityComment, Long> {
    List<ActivityComment> findByActivityIdOrderByCreatedAtAsc(Long activityId);
    
    @Query("SELECT COUNT(c) FROM ActivityComment c WHERE c.activity.id = :activityId")
    Long countByActivityId(@Param("activityId") Long activityId);
}
