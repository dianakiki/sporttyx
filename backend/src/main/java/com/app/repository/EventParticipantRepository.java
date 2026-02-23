package com.app.repository;

import com.app.model.EventParticipant;
import com.app.model.EventParticipantStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface EventParticipantRepository extends JpaRepository<EventParticipant, Long> {
    List<EventParticipant> findByParticipantIdAndStatus(Long participantId, EventParticipantStatus status);
    List<EventParticipant> findByEventIdAndStatus(Long eventId, EventParticipantStatus status);
    List<EventParticipant> findByEventId(Long eventId);
    Optional<EventParticipant> findByEventIdAndParticipantId(Long eventId, Long participantId);
    boolean existsByEventIdAndParticipantIdAndStatus(Long eventId, Long participantId, EventParticipantStatus status);
}
