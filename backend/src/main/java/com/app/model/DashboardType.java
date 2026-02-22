package com.app.model;

public enum DashboardType {
    RANKING("Рейтинг"),
    TRACKER("Трекер"),
    FEED("Лента"),
    SIMPLE_LIST("Простой список");

    private final String displayName;

    DashboardType(String displayName) {
        this.displayName = displayName;
    }

    public String getDisplayName() {
        return displayName;
    }
}
