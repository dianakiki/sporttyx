package com.app.service;

import com.app.dto.ParticipantBadgeResponse;
import com.app.model.BadgeType;
import com.app.model.Participant;
import com.app.model.ParticipantBadge;
import com.app.repository.ParticipantBadgeRepository;
import com.app.repository.ParticipantRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class BadgeService {
    
    @Autowired
    private ParticipantBadgeRepository badgeRepository;
    
    @Autowired
    private ParticipantRepository participantRepository;
    
    public ParticipantBadgeResponse awardBadge(Long participantId, BadgeType badgeType, Long awardedById, String reason) {
        // Check if badge already exists
        if (badgeRepository.existsByParticipantIdAndBadgeType(participantId, badgeType)) {
            return null; // Badge already awarded
        }
        
        Participant participant = participantRepository.findById(participantId)
                .orElseThrow(() -> new RuntimeException("Participant not found"));
        
        ParticipantBadge badge = new ParticipantBadge();
        badge.setParticipant(participant);
        badge.setBadgeType(badgeType);
        badge.setAwardedAt(LocalDateTime.now());
        badge.setReason(reason);
        
        if (awardedById != null) {
            Participant awardedBy = participantRepository.findById(awardedById)
                    .orElseThrow(() -> new RuntimeException("Awarding participant not found"));
            badge.setAwardedBy(awardedBy);
        }
        
        badge = badgeRepository.save(badge);
        return toBadgeResponse(badge);
    }
    
    public List<ParticipantBadgeResponse> getParticipantBadges(Long participantId) {
        return badgeRepository.findByParticipantIdOrderByAwardedAtDesc(participantId).stream()
                .map(this::toBadgeResponse)
                .collect(Collectors.toList());
    }
    
    private ParticipantBadgeResponse toBadgeResponse(ParticipantBadge badge) {
        return new ParticipantBadgeResponse(
                badge.getId(),
                badge.getBadgeType().name(),
                badge.getBadgeType().getDisplayName(),
                badge.getBadgeType().getDescription(),
                badge.getAwardedAt(),
                badge.getAwardedBy() != null ? badge.getAwardedBy().getName() : null,
                badge.getReason()
        );
    }
}
