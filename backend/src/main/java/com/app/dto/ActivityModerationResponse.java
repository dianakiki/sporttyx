package com.app.dto;

import com.app.model.ActivityStatus;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.List;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class ActivityModerationResponse {
    private Long id;
    private String type;
    private Integer energy;
    private String participantName;
    private Long participantId;
    private String teamName;
    private Long teamId;
    private String eventName;
    private Long eventId;
    private List<String> photoUrls;
    private ActivityStatus status;
    private LocalDateTime createdAt;
}
