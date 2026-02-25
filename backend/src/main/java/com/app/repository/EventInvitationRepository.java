package com.app.repository;

import com.app.model.EventInvitation;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface EventInvitationRepository extends JpaRepository<EventInvitation, Long> {
    Optional<EventInvitation> findByInvitationToken(String invitationToken);
    List<EventInvitation> findByEventId(Long eventId);
    List<EventInvitation> findByEventIdAndIsActiveTrue(Long eventId);
}
