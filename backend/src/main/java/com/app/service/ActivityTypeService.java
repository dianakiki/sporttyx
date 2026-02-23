package com.app.service;

import com.app.dto.ActivityTypeResponse;
import com.app.dto.CreateActivityTypeRequest;
import com.app.model.ActivityType;
import com.app.model.Event;
import com.app.repository.ActivityTypeRepository;
import com.app.repository.EventRepository;
import org.apache.poi.ss.usermodel.*;
import org.apache.poi.xssf.usermodel.XSSFWorkbook;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class ActivityTypeService {
    
    @Autowired
    private ActivityTypeRepository activityTypeRepository;
    
    @Autowired
    private EventRepository eventRepository;
    
    public List<ActivityTypeResponse> getAllActivityTypes() {
        return activityTypeRepository.findAllByOrderByNameAsc().stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
    }
    
    public List<ActivityTypeResponse> getActivityTypesByEventId(Long eventId) {
        return activityTypeRepository.findByEventIdOrderByNameAsc(eventId).stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
    }
    
    public ActivityTypeResponse getActivityTypeById(Long id) {
        ActivityType activityType = activityTypeRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Activity type not found"));
        return toResponse(activityType);
    }
    
    public ActivityTypeResponse createActivityType(CreateActivityTypeRequest request) {
        if (activityTypeRepository.findByName(request.getName()).isPresent()) {
            throw new RuntimeException("Activity type with this name already exists");
        }
        
        ActivityType activityType = new ActivityType();
        activityType.setName(request.getName());
        activityType.setDescription(request.getDescription());
        activityType.setDefaultEnergy(request.getDefaultEnergy());
        
        if (request.getEventId() != null) {
            Event event = eventRepository.findById(request.getEventId())
                    .orElseThrow(() -> new RuntimeException("Event not found"));
            activityType.setEvent(event);
        }
        
        activityType = activityTypeRepository.save(activityType);
        return toResponse(activityType);
    }
    
    public ActivityTypeResponse updateActivityType(Long id, CreateActivityTypeRequest request) {
        ActivityType activityType = activityTypeRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Activity type not found"));
        
        activityType.setName(request.getName());
        activityType.setDescription(request.getDescription());
        activityType.setDefaultEnergy(request.getDefaultEnergy());
        
        activityType = activityTypeRepository.save(activityType);
        return toResponse(activityType);
    }
    
    public void deleteActivityType(Long id) {
        activityTypeRepository.deleteById(id);
    }
    
    public int importFromExcel(MultipartFile file, Long eventId) throws IOException {
        Event event = eventRepository.findById(eventId)
                .orElseThrow(() -> new RuntimeException("Event not found"));
        
        List<ActivityType> activityTypes = new ArrayList<>();
        
        try (Workbook workbook = new XSSFWorkbook(file.getInputStream())) {
            Sheet sheet = workbook.getSheetAt(0);
            
            // Skip header row (row 0)
            for (int i = 1; i <= sheet.getLastRowNum(); i++) {
                Row row = sheet.getRow(i);
                if (row == null) continue;
                
                Cell nameCell = row.getCell(0);
                Cell descriptionCell = row.getCell(1);
                Cell energyCell = row.getCell(2);
                
                if (nameCell == null || getCellValueAsString(nameCell).trim().isEmpty()) {
                    continue;
                }
                
                String name = getCellValueAsString(nameCell).trim();
                String description = descriptionCell != null ? getCellValueAsString(descriptionCell).trim() : "";
                Integer defaultEnergy = energyCell != null ? (int) getCellValueAsNumber(energyCell) : 0;
                
                // Check if activity type already exists
                if (activityTypeRepository.findByName(name).isPresent()) {
                    continue;
                }
                
                ActivityType activityType = new ActivityType();
                activityType.setName(name);
                activityType.setDescription(description);
                activityType.setDefaultEnergy(defaultEnergy);
                activityType.setEvent(event);
                
                activityTypes.add(activityType);
            }
        }
        
        if (!activityTypes.isEmpty()) {
            activityTypeRepository.saveAll(activityTypes);
        }
        
        return activityTypes.size();
    }
    
    private String getCellValueAsString(Cell cell) {
        if (cell == null) return "";
        
        switch (cell.getCellType()) {
            case STRING:
                return cell.getStringCellValue();
            case NUMERIC:
                if (DateUtil.isCellDateFormatted(cell)) {
                    return cell.getDateCellValue().toString();
                }
                return String.valueOf((int) cell.getNumericCellValue());
            case BOOLEAN:
                return String.valueOf(cell.getBooleanCellValue());
            case FORMULA:
                return cell.getCellFormula();
            default:
                return "";
        }
    }
    
    private double getCellValueAsNumber(Cell cell) {
        if (cell == null) return 0;
        
        switch (cell.getCellType()) {
            case NUMERIC:
                return cell.getNumericCellValue();
            case STRING:
                try {
                    return Double.parseDouble(cell.getStringCellValue());
                } catch (NumberFormatException e) {
                    return 0;
                }
            default:
                return 0;
        }
    }
    
    private ActivityTypeResponse toResponse(ActivityType activityType) {
        return new ActivityTypeResponse(
                activityType.getId(),
                activityType.getName(),
                activityType.getDescription(),
                activityType.getDefaultEnergy()
        );
    }
}
