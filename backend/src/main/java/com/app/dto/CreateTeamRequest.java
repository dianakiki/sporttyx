package com.app.dto;

import lombok.Data;

import java.util.List;

@Data
public class CreateTeamRequest {
    private String name;
    private String motto;
    private List<Long> participantIds;
}
