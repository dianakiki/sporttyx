package com.app.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class ParticipantRankingResponse {
    private Long id;
    private String name;
    private String username;
    private Integer totalPoints;
    private Integer rank;
    private String profileImageUrl;
}
