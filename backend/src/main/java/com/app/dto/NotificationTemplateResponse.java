package com.app.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDateTime;
import java.util.List;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class NotificationTemplateResponse {
    private Long id;
    private String title;
    private String message;
    private String recipientType;
    private List<Long> participantIds;
    private String status;
    private Integer sentCount;
    private LocalDateTime createdAt;
    private LocalDateTime sentAt;
    private String createdByName;
}
