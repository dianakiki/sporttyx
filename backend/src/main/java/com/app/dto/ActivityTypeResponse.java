package com.app.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class ActivityTypeResponse {
    private Long id;
    private String name;
    private String description;
    private Integer defaultEnergy;
}
