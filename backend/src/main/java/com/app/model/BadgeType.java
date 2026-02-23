package com.app.model;

public enum BadgeType {
    BUG_HUNTER_BRONZE("🥉 Охотник за багами", "Отправил первый баг-репорт"),
    BUG_HUNTER_SILVER("🥈 Опытный охотник", "Отправил 5 баг-репортов"),
    BUG_HUNTER_GOLD("🥇 Мастер охотник", "Отправил 10 баг-репортов"),
    BUG_HUNTER_PLATINUM("💎 Легендарный охотник", "Отправил 25 баг-репортов"),
    CRITICAL_BUG_FINDER("🔥 Критический баг", "Нашел критический баг"),
    HELPFUL_CONTRIBUTOR("⭐ Полезный участник", "Помог улучшить систему");
    
    private final String displayName;
    private final String description;
    
    BadgeType(String displayName, String description) {
        this.displayName = displayName;
        this.description = description;
    }
    
    public String getDisplayName() {
        return displayName;
    }
    
    public String getDescription() {
        return description;
    }
}
