package com.app.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Set;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class EventRequest {
    private String name;
    private String description;
    private LocalDateTime startDate;
    private LocalDateTime endDate;
    private String status;
    private String visibility;
    private Boolean requiresActivityApproval;
    private Integer maxTeams;
    private Integer maxParticipants;
    private LocalDateTime registrationDeadline;
    private Double pointsMultiplier;
    private String customScoringRules;
    private String bannerImageUrl;
    private String logoUrl;
    private String primaryColor;
    private Boolean notificationsEnabled;
    private Integer reminderDaysBefore;
    private String externalEventId;
    private String webhookUrl;
    private Boolean displayOnHomepage;
    private List<String> dashboardTypes;
    private List<String> dashboardOrder;
    private Boolean teamBasedCompetition;
    private Boolean trackActivityDuration;
    private Set<Long> eventAdminIds;
}
