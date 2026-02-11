package com.app.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class ActivityResponse {
    private Long id;
    private String type;
    private Integer energy;
    private String participantName;
    private String photoUrl;
    private LocalDateTime createdAt;
}
