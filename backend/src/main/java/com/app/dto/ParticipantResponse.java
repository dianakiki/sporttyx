package com.app.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class ParticipantResponse {
    private Long id;
    private String username;
    private String name;
    private String email;
    private String phone;
    private String profileImageUrl;
    private String role;
    private Long teamId;
    private String teamName;
}
