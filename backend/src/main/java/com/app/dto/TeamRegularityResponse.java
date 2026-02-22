package com.app.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class TeamRegularityResponse {
    private Long id;
    private String name;
    private Integer totalPoints;
    private Integer participantCount;
    private Integer rank;
    private Integer currentStreak;
    private Integer activeDays;
    private List<Boolean> last14Days; // true = есть активность в этот день
}
