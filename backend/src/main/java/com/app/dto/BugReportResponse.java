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
public class BugReportResponse {
    private Long id;
    private String bugNumber;
    private String title;
    private String description;
    private String status;
    private LocalDateTime createdAt;
    private LocalDateTime resolvedAt;
    private String participantName;
    private Long participantId;
    private String resolvedByName;
    private String adminNotes;
    private Boolean badgeAwarded;
}
