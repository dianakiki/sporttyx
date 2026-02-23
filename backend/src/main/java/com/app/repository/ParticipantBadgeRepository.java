package com.app.repository;

import com.app.model.BadgeType;
import com.app.model.ParticipantBadge;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ParticipantBadgeRepository extends JpaRepository<ParticipantBadge, Long> {
    List<ParticipantBadge> findByParticipantIdOrderByAwardedAtDesc(Long participantId);
    Optional<ParticipantBadge> findByParticipantIdAndBadgeType(Long participantId, BadgeType badgeType);
    boolean existsByParticipantIdAndBadgeType(Long participantId, BadgeType badgeType);
}
