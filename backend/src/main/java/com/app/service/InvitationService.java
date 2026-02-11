package com.app.service;

import com.app.dto.InvitationResponse;
import com.app.model.*;
import com.app.repository.ParticipantRepository;
import com.app.repository.TeamInvitationRepository;
import com.app.repository.TeamParticipantRepository;
import com.app.repository.TeamRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class InvitationService {
    
    @Autowired
    private TeamInvitationRepository invitationRepository;
    
    @Autowired
    private TeamRepository teamRepository;
    
    @Autowired
    private ParticipantRepository participantRepository;
    
    @Autowired
    private TeamParticipantRepository teamParticipantRepository;
    
    public List<InvitationResponse> getParticipantInvitations(Long participantId) {
        return invitationRepository.findByParticipantIdAndStatus(participantId, InvitationStatus.PENDING)
                .stream()
                .map(inv -> new InvitationResponse(
                        inv.getId(),
                        inv.getTeam().getId(),
                        inv.getTeam().getName(),
                        inv.getInvitedBy().getName(),
                        inv.getInvitedAt(),
                        inv.getMessage()
                ))
                .collect(Collectors.toList());
    }
    
    public TeamInvitation createInvitation(Long teamId, Long participantId, Long invitedById, String message) {
        Team team = teamRepository.findById(teamId)
                .orElseThrow(() -> new RuntimeException("Team not found"));
        
        Participant participant = participantRepository.findById(participantId)
                .orElseThrow(() -> new RuntimeException("Participant not found"));
        
        Participant invitedBy = participantRepository.findById(invitedById)
                .orElseThrow(() -> new RuntimeException("Inviter not found"));
        
        if (teamParticipantRepository.findByTeamIdAndParticipantId(teamId, participantId).isPresent()) {
            throw new RuntimeException("Participant is already in the team");
        }
        
        if (invitationRepository.findByTeamIdAndParticipantIdAndStatus(teamId, participantId, InvitationStatus.PENDING).isPresent()) {
            throw new RuntimeException("Invitation already exists");
        }
        
        TeamInvitation invitation = new TeamInvitation();
        invitation.setTeam(team);
        invitation.setParticipant(participant);
        invitation.setInvitedBy(invitedBy);
        invitation.setStatus(InvitationStatus.PENDING);
        invitation.setMessage(message);
        
        return invitationRepository.save(invitation);
    }
    
    @Transactional
    public void acceptInvitation(Long invitationId, Long participantId) {
        TeamInvitation invitation = invitationRepository.findById(invitationId)
                .orElseThrow(() -> new RuntimeException("Invitation not found"));
        
        if (!invitation.getParticipant().getId().equals(participantId)) {
            throw new RuntimeException("Invitation does not belong to this participant");
        }
        
        // Check if participant is already in a team
        List<TeamParticipant> existingTeams = teamParticipantRepository.findByParticipantId(participantId);
        if (!existingTeams.isEmpty()) {
            throw new RuntimeException("You are already in a team. Leave your current team before joining another.");
        }
        
        if (invitation.getStatus() != InvitationStatus.PENDING) {
            throw new RuntimeException("Invitation is not pending");
        }
        
        TeamParticipant teamParticipant = new TeamParticipant();
        teamParticipant.setTeam(invitation.getTeam());
        teamParticipant.setParticipant(invitation.getParticipant());
        teamParticipant.setRole(TeamRole.PARTICIPANT);
        teamParticipantRepository.save(teamParticipant);
        
        invitation.setStatus(InvitationStatus.ACCEPTED);
        invitation.setRespondedAt(LocalDateTime.now());
        invitationRepository.save(invitation);
    }
    
    @Transactional
    public void declineInvitation(Long invitationId, Long participantId) {
        TeamInvitation invitation = invitationRepository.findById(invitationId)
                .orElseThrow(() -> new RuntimeException("Invitation not found"));
        
        if (!invitation.getParticipant().getId().equals(participantId)) {
            throw new RuntimeException("Invitation does not belong to this participant");
        }
        
        if (invitation.getStatus() != InvitationStatus.PENDING) {
            throw new RuntimeException("Invitation is not pending");
        }
        
        invitation.setStatus(InvitationStatus.DECLINED);
        invitation.setRespondedAt(LocalDateTime.now());
        invitationRepository.save(invitation);
    }
}
