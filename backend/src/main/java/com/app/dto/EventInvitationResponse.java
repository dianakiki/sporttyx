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
public class EventInvitationResponse {
    private Long id;
    private Long eventId;
    private String eventName;
    private String invitationToken;
    private String invitationUrl;
    private String description;
    private Integer maxUses;
    private Integer timesUsed;
    private LocalDateTime expiresAt;
    private Boolean isActive;
    private Boolean isExpired;
    private Boolean isMaxedOut;
    private String createdByName;
    private LocalDateTime createdAt;
}
