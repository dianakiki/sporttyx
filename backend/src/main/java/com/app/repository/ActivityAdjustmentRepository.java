package com.app.repository;

import com.app.model.ActivityAdjustment;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ActivityAdjustmentRepository extends JpaRepository<ActivityAdjustment, Long> {
    List<ActivityAdjustment> findByActivityIdOrderByCreatedAtDesc(Long activityId);
    
    @Query("SELECT COALESCE(SUM(aa.pointsAdjustment), 0) FROM ActivityAdjustment aa WHERE aa.activity.id = :activityId")
    Integer getTotalAdjustmentByActivityId(@Param("activityId") Long activityId);
}
