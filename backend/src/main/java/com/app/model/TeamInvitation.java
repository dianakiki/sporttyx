package com.app.model;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import javax.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "team_invitations")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class TeamInvitation {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @ManyToOne
    @JoinColumn(name = "team_id", nullable = false)
    private Team team;
    
    @ManyToOne
    @JoinColumn(name = "participant_id", nullable = false)
    private Participant participant;
    
    @ManyToOne
    @JoinColumn(name = "invited_by_id", nullable = false)
    private Participant invitedBy;
    
    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private InvitationStatus status = InvitationStatus.PENDING;
    
    @Column(name = "invited_at", nullable = false)
    private LocalDateTime invitedAt = LocalDateTime.now();
    
    @Column(name = "responded_at")
    private LocalDateTime respondedAt;
    
    @Column(name = "message", columnDefinition = "TEXT")
    private String message;
}
