package com.app.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.util.List;
import java.util.Map;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class EventInvitationStatsResponse {
    private Long eventId;
    private String eventName;
    private Integer totalInvitations;
    private Integer activeInvitations;
    private Integer totalRegistrations;
    private Map<String, Integer> registrationsByDay;
    private List<EventInvitationResponse> invitations;
    private List<EventInvitationUsageResponse> recentUsages;
}
