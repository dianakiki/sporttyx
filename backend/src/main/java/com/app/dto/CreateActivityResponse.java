package com.app.dto;

import lombok.AllArgsConstructor;
import lombok.Data;

import java.time.LocalDateTime;

@Data
@AllArgsConstructor
public class CreateActivityResponse {
    private Long id;
    private String type;
    private Integer energy;
    private LocalDateTime createdAt;
}
