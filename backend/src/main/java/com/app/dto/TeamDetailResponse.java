package com.app.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class TeamDetailResponse {
    private Long id;
    private String name;
    private String motto;
    private String imageUrl;
    private Integer totalPoints;
    private Integer rank;
    private List<TeamParticipantDto> participants;
    private Long eventId;
}
