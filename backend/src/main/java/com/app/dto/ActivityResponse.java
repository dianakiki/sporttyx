package com.app.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class ActivityResponse {
    private Long id;
    private String type;
    private Integer energy;
    private Integer finalPoints;
    private Integer durationMinutes;
    private String description;
    private String participantName;
    private Long participantId;
    private String participantAvatarUrl;
    private String photoUrl;
    private List<String> photoUrls;
    private LocalDateTime createdAt;
    private Long teamId;
    private String teamName;
    private String teamAvatarUrl;
    private Long eventId;
    private String eventName;
    private Boolean teamBasedCompetition;
    private Map<String, Integer> reactionCounts;
    private String userReaction;
    private Integer totalReactions;
    private Integer commentCount;
}
