package com.app.service;

import com.app.dto.*;
import com.app.model.*;
import com.app.repository.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.Comparator;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class TeamService {
    
    @Autowired
    private TeamRepository teamRepository;
    
    @Autowired
    private TeamParticipantRepository teamParticipantRepository;
    
    @Autowired
    private ParticipantRepository participantRepository;
    
    @Autowired
    private javax.persistence.EntityManager entityManager;
    
    @Autowired
    private ActivityRepository activityRepository;
    
    public List<TeamListResponse> getAllTeams() {
        return teamRepository.findAll().stream()
                .map(t -> new TeamListResponse(t.getId(), t.getName()))
                .collect(Collectors.toList());
    }
    
    public TeamDetailResponse getTeam(Long id) {
        Team team = teamRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Team not found"));
        
        List<TeamParticipant> teamParticipants = teamParticipantRepository.findByTeamId(id);
        
        List<TeamParticipantDto> participants = teamParticipants.stream()
                .map(tp -> new TeamParticipantDto(
                        tp.getParticipant().getId(),
                        tp.getParticipant().getName(),
                        tp.getRole().getName()
                ))
                .collect(Collectors.toList());
        
        Integer totalPoints = teamParticipantRepository.getTotalPointsByTeamId(id);
        if (totalPoints == null) {
            totalPoints = 0;
        }
        
        Integer rank = calculateRank(id, totalPoints);
        
        return new TeamDetailResponse(
                team.getId(),
                team.getName(),
                team.getMotto(),
                team.getImageUrl(),
                totalPoints,
                rank,
                participants
        );
    }
    
    @Transactional
    public Team createTeam(CreateTeamRequest request, Long creatorId) {
        Team team = new Team();
        team.setName(request.getName());
        team.setMotto(request.getMotto());
        team = teamRepository.save(team);
        
        Participant creator = participantRepository.findById(creatorId)
                .orElseThrow(() -> new RuntimeException("Creator not found"));
        
        TeamParticipant creatorParticipant = new TeamParticipant();
        creatorParticipant.setTeam(team);
        creatorParticipant.setParticipant(creator);
        creatorParticipant.setRole(TeamRole.CAPTAIN);
        teamParticipantRepository.save(creatorParticipant);
        
        if (request.getParticipantIds() != null) {
            for (Long participantId : request.getParticipantIds()) {
                if (!participantId.equals(creatorId)) {
                    Participant participant = participantRepository.findById(participantId)
                            .orElseThrow(() -> new RuntimeException("Participant not found: " + participantId));
                    
                    // Check if participant is already in a team
                    List<TeamParticipant> existingTeams = teamParticipantRepository.findByParticipantId(participantId);
                    if (!existingTeams.isEmpty()) {
                        throw new RuntimeException("Participant " + participant.getName() + " is already in a team");
                    }
                    
                    TeamParticipant tp = new TeamParticipant();
                    tp.setTeam(team);
                    tp.setParticipant(participant);
                    tp.setRole(TeamRole.PARTICIPANT);
                    teamParticipantRepository.save(tp);
                }
            }
        }
        
        return team;
    }
    
    @Transactional
    public Team updateTeam(Long id, UpdateTeamRequest request) {
        Team team = teamRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Team not found"));
        
        if (request.getName() != null) {
            team.setName(request.getName());
        }
        if (request.getMotto() != null) {
            team.setMotto(request.getMotto());
        }
        if (request.getImageUrl() != null) {
            team.setImageUrl(request.getImageUrl());
        }
        
        return teamRepository.save(team);
    }
    
    @Transactional
    public void deleteTeam(Long id) {
        teamRepository.deleteById(id);
    }
    
    @Transactional
    public void leaveTeam(Long teamId, Long participantId) {
        teamParticipantRepository.deleteByTeamIdAndParticipantId(teamId, participantId);
    }
    
    public List<TeamParticipantDto> getTeamParticipants(Long teamId) {
        return teamParticipantRepository.findByTeamId(teamId).stream()
                .map(tp -> new TeamParticipantDto(
                        tp.getParticipant().getId(),
                        tp.getParticipant().getName(),
                        tp.getRole().getName()
                ))
                .collect(Collectors.toList());
    }
    
    public List<TeamRankingResponse> getTeamRankings() {
        List<Team> teams = teamRepository.findAll();
        List<TeamRankingResponse> rankings = new ArrayList<>();
        
        for (Team team : teams) {
            Integer totalPoints = teamParticipantRepository.getTotalPointsByTeamId(team.getId());
            if (totalPoints == null) {
                totalPoints = 0;
            }
            
            int participantCount = teamParticipantRepository.findByTeamId(team.getId()).size();
            
            rankings.add(new TeamRankingResponse(
                    team.getId(),
                    team.getName(),
                    totalPoints,
                    participantCount,
                    0
            ));
        }
        
        rankings.sort(Comparator.comparing(TeamRankingResponse::getTotalPoints).reversed());
        
        for (int i = 0; i < rankings.size(); i++) {
            rankings.get(i).setRank(i + 1);
        }
        
        return rankings;
    }
    
    private Integer calculateRank(Long teamId, Integer totalPoints) {
        List<Team> allTeams = teamRepository.findAll();
        int rank = 1;
        
        for (Team team : allTeams) {
            if (!team.getId().equals(teamId)) {
                Integer teamPoints = teamParticipantRepository.getTotalPointsByTeamId(team.getId());
                if (teamPoints == null) {
                    teamPoints = 0;
                }
                if (teamPoints > totalPoints) {
                    rank++;
                }
            }
        }
        
        return rank;
    }
}
