package com.app.controller;

import com.app.dto.EventListResponse;
import com.app.dto.EventResponse;
import com.app.service.EventService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/events")
@CrossOrigin(origins = "http://localhost:3000")
public class EventController {
    
    @Autowired
    private EventService eventService;
    
    /**
     * Получить список всех событий
     */
    @GetMapping
    public ResponseEntity<List<EventListResponse>> getAllEvents() {
        List<EventListResponse> events = eventService.getAllEvents();
        return ResponseEntity.ok(events);
    }
    
    /**
     * Получить детальную информацию о событии
     */
    @GetMapping("/{id}")
    public ResponseEntity<EventResponse> getEvent(@PathVariable Long id) {
        EventResponse event = eventService.getEvent(id);
        return ResponseEntity.ok(event);
    }
    
    /**
     * Получить список активных событий
     */
    @GetMapping("/active")
    public ResponseEntity<List<EventResponse>> getActiveEvents() {
        List<EventResponse> events = eventService.getActiveEvents();
        return ResponseEntity.ok(events);
    }
    
    /**
     * Получить событие, отображаемое на главной странице
     */
    @GetMapping("/displayed")
    public ResponseEntity<EventResponse> getDisplayedEvent() {
        EventResponse event = eventService.getDisplayedEvent();
        if (event == null) {
            return ResponseEntity.noContent().build();
        }
        return ResponseEntity.ok(event);
    }
}
