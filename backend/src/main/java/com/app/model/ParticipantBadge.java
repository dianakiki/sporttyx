package com.app.model;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import javax.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "participant_badges")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class ParticipantBadge {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "participant_id", nullable = false)
    private Participant participant;
    
    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 50)
    private BadgeType badgeType;
    
    @Column(name = "awarded_at", nullable = false)
    private LocalDateTime awardedAt = LocalDateTime.now();
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "awarded_by")
    private Participant awardedBy;
    
    @Column(columnDefinition = "TEXT")
    private String reason;
}
