package com.app.dto;

import lombok.Data;

@Data
public class ParticipantUpdateRequest {
    private String name;
    private String email;
    private String phone;
    private String profileImageUrl;
}
