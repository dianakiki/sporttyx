package com.app.model;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import javax.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "team_participants", uniqueConstraints = {
    @UniqueConstraint(columnNames = {"team_id", "participant_id"})
})
@Data
@NoArgsConstructor
@AllArgsConstructor
public class TeamParticipant {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @ManyToOne
    @JoinColumn(name = "team_id", nullable = false)
    private Team team;
    
    @ManyToOne
    @JoinColumn(name = "participant_id", nullable = false)
    private Participant participant;
    
    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private TeamRole role = TeamRole.PARTICIPANT;
    
    @Column(name = "joined_at", nullable = false)
    private LocalDateTime joinedAt = LocalDateTime.now();
}
