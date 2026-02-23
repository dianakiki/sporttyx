package com.app.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDateTime;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class ParticipantBadgeResponse {
    private Long id;
    private String badgeType;
    private String displayName;
    private String description;
    private LocalDateTime awardedAt;
    private String awardedByName;
    private String reason;
}
