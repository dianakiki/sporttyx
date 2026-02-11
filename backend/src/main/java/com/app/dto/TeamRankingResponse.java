package com.app.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class TeamRankingResponse {
    private Long id;
    private String name;
    private Integer totalPoints;
    private Integer participantCount;
    private Integer rank;
}
