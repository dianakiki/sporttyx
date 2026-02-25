package com.app.repository;

import com.app.model.EventInvitationUsage;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface EventInvitationUsageRepository extends JpaRepository<EventInvitationUsage, Long> {
    List<EventInvitationUsage> findByInvitationId(Long invitationId);
    
    @Query("SELECT COUNT(u) FROM EventInvitationUsage u WHERE u.invitation.id = :invitationId AND u.usedAt >= :startDate AND u.usedAt <= :endDate")
    Long countUsagesByInvitationIdAndDateRange(Long invitationId, LocalDateTime startDate, LocalDateTime endDate);
    
    @Query("SELECT u FROM EventInvitationUsage u WHERE u.invitation.event.id = :eventId ORDER BY u.usedAt DESC")
    List<EventInvitationUsage> findByEventIdOrderByUsedAtDesc(Long eventId);
}
