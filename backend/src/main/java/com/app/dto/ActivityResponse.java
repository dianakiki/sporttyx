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
    private String participantName;
    private String photoUrl;
    private List<String> photoUrls;
    private LocalDateTime createdAt;
    private Long teamId;
    private String teamName;
    private Boolean teamBasedCompetition;
    private Map<String, Integer> reactionCounts;
    private String userReaction;
    private Integer totalReactions;
    private Integer commentCount;
}
