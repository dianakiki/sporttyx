package com.app.service;

import com.app.dto.ParticipantResponse;
import com.app.dto.ParticipantSearchResponse;
import com.app.dto.ParticipantUpdateRequest;
import com.app.model.Participant;
import com.app.model.TeamParticipant;
import com.app.repository.ParticipantRepository;
import com.app.repository.TeamParticipantRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class ParticipantService {
    
    @Autowired
    private ParticipantRepository participantRepository;
    
    @Autowired
    private TeamParticipantRepository teamParticipantRepository;
    
    public ParticipantResponse getParticipant(Long id) {
        Participant participant = participantRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Participant not found"));
        
        Long teamId = null;
        String teamName = null;
        List<TeamParticipant> teams = teamParticipantRepository.findByParticipantId(id);
        if (!teams.isEmpty()) {
            teamId = teams.get(0).getTeam().getId();
            teamName = teams.get(0).getTeam().getName();
        }
        
        return new ParticipantResponse(
                participant.getId(),
                participant.getUsername(),
                participant.getName(),
                participant.getEmail(),
                participant.getPhone(),
                participant.getProfileImageUrl(),
                participant.getRole().name(),
                teamId,
                teamName
        );
    }
    
    public ParticipantResponse updateParticipant(Long id, ParticipantUpdateRequest request) {
        Participant participant = participantRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Participant not found"));
        
        if (request.getName() != null) {
            participant.setName(request.getName());
        }
        if (request.getEmail() != null) {
            participant.setEmail(request.getEmail());
        }
        if (request.getPhone() != null) {
            participant.setPhone(request.getPhone());
        }
        if (request.getProfileImageUrl() != null) {
            participant.setProfileImageUrl(request.getProfileImageUrl());
        }
        
        participant = participantRepository.save(participant);
        
        return getParticipant(participant.getId());
    }
    
    public void deleteParticipant(Long id) {
        participantRepository.deleteById(id);
    }
    
    public List<ParticipantSearchResponse> searchParticipants(String query) {
        return participantRepository.searchByName(query).stream()
                .map(p -> new ParticipantSearchResponse(p.getId(), p.getName()))
                .collect(Collectors.toList());
    }
}
