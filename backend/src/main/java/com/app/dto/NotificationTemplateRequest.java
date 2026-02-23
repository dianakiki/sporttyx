package com.app.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.util.List;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class NotificationTemplateRequest {
    private Long eventId;
    private String title;
    private String message;
    private String recipientType;
    private List<Long> participantIds;
}
