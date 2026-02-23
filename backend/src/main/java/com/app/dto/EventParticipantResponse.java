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
public class EventParticipantResponse {
    private Long id;
    private Long eventId;
    private String eventName;
    private Long participantId;
    private String participantName;
    private String status;
    private LocalDateTime invitedAt;
    private LocalDateTime joinedAt;
    private String invitedByName;
}
