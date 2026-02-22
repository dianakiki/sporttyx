package com.app.repository;

import com.app.model.Event;
import com.app.model.EventStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Repository
public interface EventRepository extends JpaRepository<Event, Long> {
    List<Event> findByStatus(EventStatus status);
    
    Optional<Event> findByDisplayOnHomepageTrue();
    
    @Query("SELECT e FROM Event e WHERE e.startDate <= :now AND e.endDate >= :now AND e.status = 'ACTIVE'")
    List<Event> findActiveEvents(LocalDateTime now);
    
    @Query("SELECT e FROM Event e JOIN e.eventAdmins a WHERE a.id = :participantId")
    List<Event> findByEventAdminId(Long participantId);
}
