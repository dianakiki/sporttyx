package com.app.controller;

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
    
    @GetMapping("/{id}")
    public ResponseEntity<ParticipantResponse> getParticipant(@PathVariable Long id) {
        ParticipantResponse response = participantService.getParticipant(id);
        return ResponseEntity.ok(response);
    }
    
    @PutMapping("/{id}")
    public ResponseEntity<ParticipantResponse> updateParticipant(
            @PathVariable Long id,
            @RequestBody ParticipantUpdateRequest request) {
        ParticipantResponse response = participantService.updateParticipant(id, request);
        return ResponseEntity.ok(response);
    }
    
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteParticipant(@PathVariable Long id) {
        participantService.deleteParticipant(id);
        return ResponseEntity.status(HttpStatus.NO_CONTENT).build();
    }
    
    @GetMapping("/search")
    public ResponseEntity<List<ParticipantSearchResponse>> searchParticipants(
            @RequestParam String query) {
        List<ParticipantSearchResponse> results = participantService.searchParticipants(query);
        return ResponseEntity.ok(results);
    }
}
