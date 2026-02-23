package com.app.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class CreateBonusTypeRequest {
    private Long eventId;
    private String name;
    private String description;
    private Integer pointsAdjustment;
    private String type; // BONUS or PENALTY
}
