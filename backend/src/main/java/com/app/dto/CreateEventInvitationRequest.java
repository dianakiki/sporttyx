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
public class CreateEventInvitationRequest {
    private Long eventId;
    private String description;
    private Integer maxUses;
    private LocalDateTime expiresAt;
}
