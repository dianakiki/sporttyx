package com.app.repository;

import com.app.model.EventNews;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface EventNewsRepository extends JpaRepository<EventNews, Long> {
    List<EventNews> findByEventIdOrderByCreatedAtDesc(Long eventId);
}
