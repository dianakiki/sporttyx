package com.app.repository;

import com.app.model.InvitationStatus;
import com.app.model.TeamInvitation;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface TeamInvitationRepository extends JpaRepository<TeamInvitation, Long> {
    List<TeamInvitation> findByParticipantIdAndStatus(Long participantId, InvitationStatus status);
    
    List<TeamInvitation> findByTeamIdAndStatus(Long teamId, InvitationStatus status);
    
    Optional<TeamInvitation> findByTeamIdAndParticipantIdAndStatus(Long teamId, Long participantId, InvitationStatus status);
}
