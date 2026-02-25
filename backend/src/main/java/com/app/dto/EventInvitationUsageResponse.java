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
public class EventInvitationUsageResponse {
    private Long id;
    private Long invitationId;
    private String invitationDescription;
    private Long participantId;
    private String participantName;
    private String participantUsername;
    private String ipAddress;
    private LocalDateTime usedAt;
}
