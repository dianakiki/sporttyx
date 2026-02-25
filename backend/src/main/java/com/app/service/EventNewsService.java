package com.app.service;

import com.app.dto.EventNewsRequest;
import com.app.dto.EventNewsResponse;
import com.app.model.Event;
import com.app.model.EventNews;
import com.app.model.Participant;
import com.app.repository.EventNewsRepository;
import com.app.repository.EventRepository;
import com.app.repository.ParticipantRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class EventNewsService {
    
    @Autowired
    private EventNewsRepository eventNewsRepository;
    
    @Autowired
    private EventRepository eventRepository;
    
    @Autowired
    private ParticipantRepository participantRepository;
    
    public List<EventNewsResponse> getEventNews(Long eventId) {
        return eventNewsRepository.findByEventIdOrderByCreatedAtDesc(eventId).stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
    }
    
    @Transactional
    public EventNewsResponse createEventNews(Long eventId, EventNewsRequest request, Long participantId) {
        Event event = eventRepository.findById(eventId)
                .orElseThrow(() -> new RuntimeException("Event not found"));
        
        Participant participant = participantRepository.findById(participantId)
                .orElseThrow(() -> new RuntimeException("Participant not found"));
        
        EventNews news = new EventNews();
        news.setEvent(event);
        news.setContent(request.getContent());
        news.setCreatedBy(participant);
        
        news = eventNewsRepository.save(news);
        return toResponse(news);
    }
    
    @Transactional
    public EventNewsResponse updateEventNews(Long newsId, EventNewsRequest request) {
        EventNews news = eventNewsRepository.findById(newsId)
                .orElseThrow(() -> new RuntimeException("News not found"));
        
        news.setContent(request.getContent());
        news = eventNewsRepository.save(news);
        return toResponse(news);
    }
    
    @Transactional
    public void deleteEventNews(Long newsId) {
        eventNewsRepository.deleteById(newsId);
    }
    
    private EventNewsResponse toResponse(EventNews news) {
        return new EventNewsResponse(
                news.getId(),
                news.getEvent().getId(),
                news.getContent(),
                news.getCreatedBy().getId(),
                news.getCreatedBy().getName(),
                news.getCreatedBy().getUsername(),
                news.getCreatedAt(),
                news.getUpdatedAt()
        );
    }
}
