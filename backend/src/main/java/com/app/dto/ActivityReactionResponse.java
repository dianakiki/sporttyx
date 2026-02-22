package com.app.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.Map;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class ActivityReactionResponse {
    private Map<String, Integer> reactionCounts;
    private String userReaction;
}
