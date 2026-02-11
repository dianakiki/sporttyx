package com.app.dto;

import lombok.Data;

@Data
public class CreateTeamAdminRequest {
    private String name;
    private String motto;
    private String imageUrl;
}
