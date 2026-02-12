package com.app.model;

public enum TeamRole {
    CAPTAIN("КАПИТАН"),
    PARTICIPANT("УЧАСТНИК");
    
    private final String name;
    
    TeamRole(String name) {
        this.name = name;
    }
    
    public String getName() {
        return name;
    }
}
