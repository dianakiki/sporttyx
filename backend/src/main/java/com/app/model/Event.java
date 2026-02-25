package com.app.model;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import javax.persistence.*;
import java.time.LocalDateTime;
import java.util.HashSet;
import java.util.Set;

@Entity
@Table(name = "events")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
public class Event {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @Column(nullable = false, length = 200)
    private String name;
    
    @Column(columnDefinition = "TEXT")
    private String description;
    
    @Column(name = "start_date", nullable = false)
    private LocalDateTime startDate;
    
    @Column(name = "end_date", nullable = false)
    private LocalDateTime endDate;
    
    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private EventStatus status = EventStatus.DRAFT;
    
    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private EventVisibility visibility = EventVisibility.PUBLIC;
    
    @Column(name = "requires_activity_approval", nullable = false)
    private Boolean requiresActivityApproval = false;
    
    @Column(name = "max_teams")
    private Integer maxTeams;
    
    @Column(name = "max_participants")
    private Integer maxParticipants;
    
    @Column(name = "registration_deadline")
    private LocalDateTime registrationDeadline;
    
    @Column(name = "points_multiplier")
    private Double pointsMultiplier = 1.0;
    
    @Column(name = "custom_scoring_rules", columnDefinition = "TEXT")
    private String customScoringRules;
    
    @Column(name = "banner_image_url")
    private String bannerImageUrl;
    
    @Column(name = "logo_url")
    private String logoUrl;
    
    @Column(name = "primary_color", length = 7)
    private String primaryColor;
    
    @Column(name = "notifications_enabled", nullable = false)
    private Boolean notificationsEnabled = true;
    
    @Column(name = "reminder_days_before")
    private Integer reminderDaysBefore;
    
    @Column(name = "external_event_id")
    private String externalEventId;
    
    @Column(name = "webhook_url")
    private String webhookUrl;
    
    @Column(name = "display_on_homepage", nullable = false)
    private Boolean displayOnHomepage = false;
    
    @Column(name = "dashboard_types", length = 500)
    private String dashboardTypes;
    
    @Column(name = "dashboard_order", length = 500)
    private String dashboardOrder;
    
    @Column(name = "team_based_competition", nullable = false)
    private Boolean teamBasedCompetition = true;
    
    @Column(name = "track_activity_duration", nullable = false)
    private Boolean trackActivityDuration = false;
    
    @ManyToMany(fetch = FetchType.LAZY)
    @JoinTable(
        name = "event_admins",
        joinColumns = @JoinColumn(name = "event_id"),
        inverseJoinColumns = @JoinColumn(name = "participant_id")
    )
    private Set<Participant> eventAdmins = new HashSet<>();
    
    @Column(name = "created_at", nullable = false)
    private LocalDateTime createdAt = LocalDateTime.now();
    
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;
    
    @PreUpdate
    protected void onUpdate() {
        this.updatedAt = LocalDateTime.now();
    }
}
