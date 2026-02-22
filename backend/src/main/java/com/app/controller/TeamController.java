package com.app.controller;

import com.app.dto.*;
import com.app.model.Team;
import com.app.security.JwtUtil;
import com.app.service.ActivityService;
import com.app.service.ImageService;
import com.app.service.TeamService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import javax.servlet.http.HttpServletRequest;
import java.io.IOException;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/teams")
@CrossOrigin(origins = "http://localhost:3000")
public class TeamController {
    
    @Autowired
    private TeamService teamService;
    
    @Autowired
    private ActivityService activityService;
    
    @Autowired
    private ImageService imageService;
    
    @Autowired
    private JwtUtil jwtUtil;
    
    /**
     * Получить список всех команд
     */
    @GetMapping
    public ResponseEntity<List<TeamListResponse>> getAllTeams() {
        List<TeamListResponse> teams = teamService.getAllTeams();
        return ResponseEntity.ok(teams);
    }
    
    /**
     * Получить детальную информацию о команде
     */
    @GetMapping("/{id}")
    public ResponseEntity<TeamDetailResponse> getTeam(@PathVariable Long id) {
        TeamDetailResponse team = teamService.getTeam(id);
        return ResponseEntity.ok(team);
    }
    
    /**
     * Создать новую команду
     */
    @PostMapping
    public ResponseEntity<Team> createTeam(
            @RequestBody CreateTeamRequest request,
            HttpServletRequest httpRequest) {
        Long userId = extractUserIdFromRequest(httpRequest);
        Team team = teamService.createTeam(request, userId);
        return ResponseEntity.status(HttpStatus.CREATED).body(team);
    }
    
    /**
     * Обновить информацию о команде
     */
    @PutMapping("/{id}")
    public ResponseEntity<Team> updateTeam(
            @PathVariable Long id,
            @RequestBody UpdateTeamRequest request) {
        try {
            System.out.println("=== UPDATE TEAM REQUEST ===");
            System.out.println("Team ID: " + id);
            System.out.println("Request: " + request);
            Team team = teamService.updateTeam(id, request);
            return ResponseEntity.ok(team);
        } catch (Exception e) {
            System.err.println("ERROR updating team: " + e.getMessage());
            e.printStackTrace();
            throw e;
        }
    }
    
    /**
     * Удалить команду
     */
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteTeam(@PathVariable Long id) {
        teamService.deleteTeam(id);
        return ResponseEntity.status(HttpStatus.NO_CONTENT).build();
    }
    
    /**
     * Покинуть команду
     */
    @PostMapping("/{teamId}/leave")
    public ResponseEntity<MessageResponse> leaveTeam(
            @PathVariable Long teamId,
            HttpServletRequest httpRequest) {
        Long userId = extractUserIdFromRequest(httpRequest);
        teamService.leaveTeam(teamId, userId);
        return ResponseEntity.ok(new MessageResponse("You have left the team"));
    }
    
    /**
     * Получить список участников команды
     */
    @GetMapping("/{id}/participants")
    public ResponseEntity<List<TeamParticipantDto>> getTeamParticipants(@PathVariable Long id) {
        List<TeamParticipantDto> participants = teamService.getTeamParticipants(id);
        return ResponseEntity.ok(participants);
    }
    
    /**
     * Получить рейтинг команд
     */
    @GetMapping("/rankings")
    public ResponseEntity<List<TeamRankingResponse>> getTeamRankings() {
        List<TeamRankingResponse> rankings = teamService.getTeamRankings();
        return ResponseEntity.ok(rankings);
    }
    
    /**
     * Получить статистику регулярности активностей команд
     */
    @GetMapping("/regularity-stats")
    public ResponseEntity<List<TeamRegularityResponse>> getTeamRegularityStats() {
        List<TeamRegularityResponse> stats = teamService.getTeamRegularityStats();
        return ResponseEntity.ok(stats);
    }
    
    /**
     * Получить тепловую карту активностей команды
     */
    @GetMapping("/{id}/activity-heatmap")
    public ResponseEntity<List<ActivityHeatmapResponse>> getTeamActivityHeatmap(@PathVariable Long id) {
        List<ActivityHeatmapResponse> heatmap = activityService.getTeamActivityHeatmap(id);
        return ResponseEntity.ok(heatmap);
    }
    
    /**
     * Загрузить изображение команды
     */
    @PostMapping("/{id}/upload-image")
    public ResponseEntity<Map<String, String>> uploadTeamImage(
            @PathVariable Long id,
            @RequestParam("image") MultipartFile image) {
        try {
            String imageUrl = imageService.saveTeamImage(image);
            teamService.updateTeamImage(id, imageUrl);
            
            Map<String, String> response = new HashMap<>();
            response.put("imageUrl", imageUrl);
            return ResponseEntity.ok(response);
        } catch (IOException e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }
    
    private Long extractUserIdFromRequest(HttpServletRequest request) {
        String authHeader = request.getHeader("Authorization");
        if (authHeader != null && authHeader.startsWith("Bearer ")) {
            String token = authHeader.substring(7);
            return jwtUtil.extractUserId(token);
        }
        throw new RuntimeException("No valid token found");
    }
}
