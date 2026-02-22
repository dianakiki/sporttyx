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
    
    @Transactional
    public TeamInvitation createInvitation(Long teamId, Long participantId, Long invitedById, String message) {
        Team team = teamRepository.findById(teamId)
                .orElseThrow(() -> new RuntimeException("Team not found"));
        
        Participant participant = participantRepository.findById(participantId)
                .orElseThrow(() -> new RuntimeException("Participant not found"));
        
        Participant invitedBy = participantRepository.findById(invitedById)
                .orElseThrow(() -> new RuntimeException("Inviter not found"));
        
        // Проверяем, что участник еще не в команде
        if (teamParticipantRepository.findByTeamIdAndParticipantId(teamId, participantId).isPresent()) {
            throw new RuntimeException(participant.getName() + " уже состоит в этой команде");
        }
        
        // Проверяем, что участник не состоит в другой команде
        List<TeamParticipant> existingTeams = teamParticipantRepository.findByParticipantId(participantId);
        if (!existingTeams.isEmpty()) {
            String existingTeamName = existingTeams.get(0).getTeam().getName();
            throw new RuntimeException(participant.getName() + " уже состоит в команде \"" + existingTeamName + "\". Один участник может быть только в одной команде.");
        }
        
        // Сразу добавляем участника в команду
        TeamParticipant teamParticipant = new TeamParticipant();
        teamParticipant.setTeam(team);
        teamParticipant.setParticipant(participant);
        teamParticipant.setRole(TeamRole.PARTICIPANT);
        teamParticipantRepository.save(teamParticipant);
        
        // Создаем уведомление (не приглашение)
        TeamInvitation notification = new TeamInvitation();
        notification.setTeam(team);
        notification.setParticipant(participant);
        notification.setInvitedBy(invitedBy);
        notification.setStatus(InvitationStatus.ACCEPTED); // Сразу принято
        notification.setMessage(message != null ? message : "Вас добавили в команду " + team.getName());
        notification.setRespondedAt(LocalDateTime.now());
        
        return invitationRepository.save(notification);
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
