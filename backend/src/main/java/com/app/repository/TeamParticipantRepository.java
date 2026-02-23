package com.app.repository;

import com.app.model.TeamParticipant;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface TeamParticipantRepository extends JpaRepository<TeamParticipant, Long> {
    List<TeamParticipant> findByTeamId(Long teamId);
    
    List<TeamParticipant> findByParticipantId(Long participantId);
    
    Optional<TeamParticipant> findByTeamIdAndParticipantId(Long teamId, Long participantId);
    
    void deleteByTeamIdAndParticipantId(Long teamId, Long participantId);
    
    @Query("SELECT SUM(a.energy) FROM Activity a WHERE a.team.id = :teamId AND (a.status = 'APPROVED' OR a.status = 'AUTO_APPROVED')")
    Integer getTotalPointsByTeamId(@Param("teamId") Long teamId);
}
