package com.app.dto;

import lombok.Data;

@Data
public class InviteParticipantRequest {
    private Long participantId;
    private String message;
}
