package com.app.repository;

import com.app.model.ActivityPhoto;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ActivityPhotoRepository extends JpaRepository<ActivityPhoto, Long> {
    List<ActivityPhoto> findByActivityIdOrderByDisplayOrderAsc(Long activityId);
}
