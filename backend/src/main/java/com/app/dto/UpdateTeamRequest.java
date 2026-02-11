package com.app.dto;

import lombok.Data;

import java.util.List;

@Data
public class UpdateTeamRequest {
    private String name;
    private String motto;
    private String imageUrl;
    private List<ParticipantRoleDto> participants;
    
    @Data
    public static class ParticipantRoleDto {
        private Long id;
        private String name;
        private String role;
    }
}
