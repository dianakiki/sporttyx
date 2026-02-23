package com.app.controller;

import com.app.dto.BonusTypeResponse;
import com.app.dto.CreateBonusTypeRequest;
import com.app.model.BonusType;
import com.app.model.BonusTypeEnum;
import com.app.model.Event;
import com.app.repository.BonusTypeRepository;
import com.app.repository.EventRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/bonus-types")
@CrossOrigin(origins = "http://localhost:3000")
public class BonusTypeController {
    
    @Autowired
    private BonusTypeRepository bonusTypeRepository;
    
    @Autowired
    private EventRepository eventRepository;
    
    @GetMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'MODERATOR')")
    public ResponseEntity<List<BonusTypeResponse>> getBonusTypesByEvent(@RequestParam Long eventId) {
        List<BonusType> bonusTypes = bonusTypeRepository.findByEventIdAndIsActiveTrue(eventId);
        List<BonusTypeResponse> response = bonusTypes.stream()
                .map(bt -> new BonusTypeResponse(
                        bt.getId(),
                        bt.getName(),
                        bt.getDescription(),
                        bt.getPointsAdjustment(),
                        bt.getType().name()
                ))
                .collect(Collectors.toList());
        return ResponseEntity.ok(response);
    }
    
    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<BonusTypeResponse> createBonusType(@RequestBody CreateBonusTypeRequest request) {
        Event event = eventRepository.findById(request.getEventId())
                .orElseThrow(() -> new RuntimeException("Event not found"));
        
        BonusType bonusType = new BonusType();
        bonusType.setEvent(event);
        bonusType.setName(request.getName());
        bonusType.setDescription(request.getDescription());
        
        // Ensure penalties have negative values
        BonusTypeEnum type = BonusTypeEnum.valueOf(request.getType());
        Integer pointsAdjustment = request.getPointsAdjustment();
        if (type == BonusTypeEnum.PENALTY && pointsAdjustment > 0) {
            pointsAdjustment = -pointsAdjustment;
        }
        
        bonusType.setPointsAdjustment(pointsAdjustment);
        bonusType.setType(type);
        bonusType.setIsActive(true);
        
        bonusType = bonusTypeRepository.save(bonusType);
        
        BonusTypeResponse response = new BonusTypeResponse(
                bonusType.getId(),
                bonusType.getName(),
                bonusType.getDescription(),
                bonusType.getPointsAdjustment(),
                bonusType.getType().name()
        );
        
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }
    
    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<BonusTypeResponse> updateBonusType(
            @PathVariable Long id,
            @RequestBody CreateBonusTypeRequest request
    ) {
        BonusType bonusType = bonusTypeRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Bonus type not found"));
        
        bonusType.setName(request.getName());
        bonusType.setDescription(request.getDescription());
        
        // Ensure penalties have negative values
        BonusTypeEnum type = BonusTypeEnum.valueOf(request.getType());
        Integer pointsAdjustment = request.getPointsAdjustment();
        if (type == BonusTypeEnum.PENALTY && pointsAdjustment > 0) {
            pointsAdjustment = -pointsAdjustment;
        }
        
        bonusType.setPointsAdjustment(pointsAdjustment);
        bonusType.setType(type);
        
        bonusType = bonusTypeRepository.save(bonusType);
        
        BonusTypeResponse response = new BonusTypeResponse(
                bonusType.getId(),
                bonusType.getName(),
                bonusType.getDescription(),
                bonusType.getPointsAdjustment(),
                bonusType.getType().name()
        );
        
        return ResponseEntity.ok(response);
    }
    
    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Void> deleteBonusType(@PathVariable Long id) {
        BonusType bonusType = bonusTypeRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Bonus type not found"));
        
        bonusType.setIsActive(false);
        bonusTypeRepository.save(bonusType);
        
        return ResponseEntity.ok().build();
    }
}
