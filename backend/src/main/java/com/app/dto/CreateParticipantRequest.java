package com.app.dto;

import lombok.Data;

@Data
public class CreateParticipantRequest {
    private String username;
    private String password;
    private String name;
    private String email;
    private String phone;
    private String role;
}
