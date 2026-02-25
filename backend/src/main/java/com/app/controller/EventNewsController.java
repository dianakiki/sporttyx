package com.app.controller;

import com.app.dto.EventNewsRequest;
import com.app.dto.EventNewsResponse;
import com.app.model.Participant;
import com.app.repository.ParticipantRepository;
import com.app.service.EventNewsService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/events")
@CrossOrigin(origins = "http://localhost:3000")
public class EventNewsController {
    
    @Autowired
    private EventNewsService eventNewsService;
    
    @Autowired
    private ParticipantRepository participantRepository;
    
    @GetMapping("/{eventId}/news")
    public ResponseEntity<List<EventNewsResponse>> getEventNews(@PathVariable Long eventId) {
        List<EventNewsResponse> news = eventNewsService.getEventNews(eventId);
        return ResponseEntity.ok(news);
    }
    
    @PostMapping("/{eventId}/news")
    public ResponseEntity<EventNewsResponse> createEventNews(
            @PathVariable Long eventId,
            @RequestBody EventNewsRequest request) {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String username = ((UserDetails) authentication.getPrincipal()).getUsername();
        Participant participant = participantRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("Participant not found"));
        
        EventNewsResponse news = eventNewsService.createEventNews(eventId, request, participant.getId());
        return ResponseEntity.status(HttpStatus.CREATED).body(news);
    }
    
    @PutMapping("/news/{newsId}")
    public ResponseEntity<EventNewsResponse> updateEventNews(
            @PathVariable Long newsId,
            @RequestBody EventNewsRequest request) {
        EventNewsResponse news = eventNewsService.updateEventNews(newsId, request);
        return ResponseEntity.ok(news);
    }
    
    @DeleteMapping("/news/{newsId}")
    public ResponseEntity<Void> deleteEventNews(@PathVariable Long newsId) {
        eventNewsService.deleteEventNews(newsId);
        return ResponseEntity.noContent().build();
    }
}
