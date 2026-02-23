package com.app.controller;

import com.app.dto.ChangePasswordRequest;
import com.app.dto.EventResponse;
import com.app.dto.ParticipantRankingResponse;
import com.app.dto.ParticipantResponse;
import com.app.dto.ParticipantSearchResponse;
import com.app.dto.ParticipantUpdateRequest;
import com.app.service.ParticipantService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/participants")
@CrossOrigin(origins = "http://localhost:3000")
public class ParticipantController {
    
    @Autowired
    private ParticipantService participantService;
    
    /**
     * Получить информацию об участнике
     */
    @GetMapping("/{id}")
    public ResponseEntity<ParticipantResponse> getParticipant(@PathVariable Long id) {
        ParticipantResponse response = participantService.getParticipant(id);
        return ResponseEntity.ok(response);
    }
    
    /**
     * Обновить профиль участника
     */
    @PutMapping("/{id}")
    public ResponseEntity<ParticipantResponse> updateParticipant(
            @PathVariable Long id,
            @RequestBody ParticipantUpdateRequest request) {
        ParticipantResponse response = participantService.updateParticipant(id, request);
        return ResponseEntity.ok(response);
    }
    
    /**
     * Удалить участника
     */
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteParticipant(@PathVariable Long id) {
        participantService.deleteParticipant(id);
        return ResponseEntity.status(HttpStatus.NO_CONTENT).build();
    }
    
    /**
     * Поиск участников по имени или username
     */
    @GetMapping("/search")
    public ResponseEntity<List<ParticipantSearchResponse>> searchParticipants(
            @RequestParam String query) {
        List<ParticipantSearchResponse> results = participantService.searchParticipants(query);
        return ResponseEntity.ok(results);
    }
    
    /**
     * Изменить пароль участника
     */
    @PostMapping("/{id}/change-password")
    public ResponseEntity<Void> changePassword(
            @PathVariable Long id,
            @RequestBody ChangePasswordRequest request) {
        participantService.changePassword(id, request);
        return ResponseEntity.ok().build();
    }
    
    /**
     * Получить рейтинг участников для события
     */
    @GetMapping("/rankings")
    public ResponseEntity<List<ParticipantRankingResponse>> getParticipantRankings(
            @RequestParam Long eventId) {
        List<ParticipantRankingResponse> rankings = participantService.getParticipantRankings(eventId);
        return ResponseEntity.ok(rankings);
    }
    
    /**
     * Получить все события, в которых участвует пользователь
     */
    @GetMapping("/{id}/events")
    public ResponseEntity<List<EventResponse>> getParticipantEvents(@PathVariable Long id) {
        List<EventResponse> events = participantService.getParticipantEvents(id);
        return ResponseEntity.ok(events);
    }
}
