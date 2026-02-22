package com.app.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.Map;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class CommentResponse {
    private Long id;
    private Long activityId;
    private Long participantId;
    private String participantName;
    private String text;
    private Long mentionedParticipantId;
    private String mentionedParticipantName;
    private Map<String, Integer> reactionCounts;
    private String userReaction;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    private Boolean canEdit;
    private Boolean canDelete;
}
