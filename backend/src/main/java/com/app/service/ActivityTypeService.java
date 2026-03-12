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
        // uniqueness: name must be unique within one event
        if (request.getEventId() != null) {
            if (activityTypeRepository.findByNameAndEventId(request.getName(), request.getEventId()).isPresent()) {
                throw new RuntimeException("Тип активности с таким названием уже существует для этого мероприятия");
            }
        } else {
            // types without event must still be unique by name globally
            if (activityTypeRepository.findByName(request.getName()).isPresent()) {
                throw new RuntimeException("Activity type with this name already exists");
            }
        }

        validateTimeLimits(request);
        
        ActivityType activityType = new ActivityType();
        activityType.setName(request.getName());
        activityType.setDescription(request.getDescription());
        activityType.setDefaultEnergy(request.getDefaultEnergy());
        applyTimeLimits(activityType, request);
        
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

        // uniqueness check on update: same rule — name unique within event
        Long eventId = activityType.getEvent() != null ? activityType.getEvent().getId() : null;
        String newName = request.getName();

        if (eventId != null) {
            activityTypeRepository.findByNameAndEventId(newName, eventId)
                    .filter(existing -> !existing.getId().equals(id))
                    .ifPresent(existing -> {
                        throw new RuntimeException("Тип активности с таким названием уже существует для этого мероприятия");
                    });
        } else {
            activityTypeRepository.findByName(newName)
                    .filter(existing -> !existing.getId().equals(id))
                    .ifPresent(existing -> {
                        throw new RuntimeException("Activity type with this name already exists");
                    });
        }

        validateTimeLimits(request);
        
        activityType.setName(request.getName());
        activityType.setDescription(request.getDescription());
        activityType.setDefaultEnergy(request.getDefaultEnergy());
        applyTimeLimits(activityType, request);
        
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
        List<String> errors = new ArrayList<>();
        
        try (Workbook workbook = new XSSFWorkbook(file.getInputStream())) {
            Sheet sheet = workbook.getSheetAt(0);
            
            if (sheet.getLastRowNum() < 1) {
                throw new RuntimeException("Файл должен содержать хотя бы заголовок и одну строку данных");
            }
            
            // Читаем заголовки из первой строки
            Row headerRow = sheet.getRow(0);
            if (headerRow == null) {
                throw new RuntimeException("Не найдена строка заголовков");
            }
            
            // Определяем индексы столбцов по заголовкам
            int nameColumnIndex = -1;
            int descriptionColumnIndex = -1;
            int energyColumnIndex = -1;
            int timeLimitColumnIndex = -1;
            int minDurationColumnIndex = -1;
            int maxDurationColumnIndex = -1;
            
            for (int i = 0; i <= headerRow.getLastCellNum(); i++) {
                Cell cell = headerRow.getCell(i);
                if (cell == null) continue;
                
                String headerValue = getCellValueAsString(cell).trim().toLowerCase();
                
                // Поддержка русских и английских названий
                if (nameColumnIndex == -1 && (headerValue.contains("название") || 
                    headerValue.contains("name") || headerValue.contains("активность") || 
                    headerValue.contains("activity") || headerValue.contains("тип") || 
                    headerValue.contains("type"))) {
                    nameColumnIndex = i;
                } else if (descriptionColumnIndex == -1 && (headerValue.contains("описание") || 
                    headerValue.contains("description") || headerValue.contains("опис"))) {
                    descriptionColumnIndex = i;
                } else if (energyColumnIndex == -1 && (headerValue.contains("балл") || 
                    headerValue.contains("points") || headerValue.contains("энергия") || 
                    headerValue.contains("energy") || headerValue.contains("очки") || 
                    headerValue.contains("score"))) {
                    energyColumnIndex = i;
                } else if (timeLimitColumnIndex == -1 && (headerValue.contains("ограничение по времени") ||
                    headerValue.contains("time limit") || headerValue.contains("limit"))) {
                    timeLimitColumnIndex = i;
                } else if (minDurationColumnIndex == -1 && (headerValue.contains("мин") && headerValue.contains("время") ||
                    headerValue.contains("min") && headerValue.contains("time"))) {
                    minDurationColumnIndex = i;
                } else if (maxDurationColumnIndex == -1 && (headerValue.contains("макс") && headerValue.contains("время") ||
                    headerValue.contains("max") && headerValue.contains("time"))) {
                    maxDurationColumnIndex = i;
                }
            }
            
            // Если не нашли столбцы по заголовкам, используем позиции по умолчанию (0, 1, 2)
            if (nameColumnIndex == -1) {
                nameColumnIndex = 0;
                descriptionColumnIndex = 1;
                energyColumnIndex = 2;
                // новые поля будут отсутствовать в старых шаблонах — оставляем индексы -1
            }
            
            // Обрабатываем данные, начиная со второй строки
            for (int i = 1; i <= sheet.getLastRowNum(); i++) {
                Row row = sheet.getRow(i);
                if (row == null) continue;
                
                Cell nameCell = row.getCell(nameColumnIndex);
                Cell descriptionCell = descriptionColumnIndex >= 0 ? row.getCell(descriptionColumnIndex) : null;
                Cell energyCell = energyColumnIndex >= 0 ? row.getCell(energyColumnIndex) : null;
                Cell timeLimitCell = timeLimitColumnIndex >= 0 ? row.getCell(timeLimitColumnIndex) : null;
                Cell minDurationCell = minDurationColumnIndex >= 0 ? row.getCell(minDurationColumnIndex) : null;
                Cell maxDurationCell = maxDurationColumnIndex >= 0 ? row.getCell(maxDurationColumnIndex) : null;
                
                if (nameCell == null || getCellValueAsString(nameCell).trim().isEmpty()) {
                    errors.add("Строка " + (i + 1) + ": пропущена (нет названия активности)");
                    continue;
                }
                
                String name = getCellValueAsString(nameCell).trim();
                String description = descriptionCell != null ? getCellValueAsString(descriptionCell).trim() : "";
                Integer defaultEnergy = energyCell != null ? (int) getCellValueAsNumber(energyCell) : 0;
                
                // Валидация
                if (name.length() > 200) {
                    errors.add("Строка " + (i + 1) + ": название слишком длинное (максимум 200 символов)");
                    continue;
                }
                
                if (defaultEnergy < 0) {
                    errors.add("Строка " + (i + 1) + ": баллы не могут быть отрицательными, установлено 0");
                    defaultEnergy = 0;
                }

                // Чтение ограничений по времени
                Boolean timeLimitRequired = null;
                Integer minDurationMinutes = null;
                Integer maxDurationMinutes = null;

                if (timeLimitCell != null) {
                    String raw = getCellValueAsString(timeLimitCell).trim().toLowerCase();
                    if (!raw.isEmpty()) {
                        if (raw.equals("true") || raw.equals("1") || raw.equals("да") || raw.equals("yes")) {
                            timeLimitRequired = true;
                        } else if (raw.equals("false") || raw.equals("0") || raw.equals("нет") || raw.equals("no")) {
                            timeLimitRequired = false;
                        }
                    }
                }

                if (minDurationCell != null) {
                    double val = getCellValueAsNumber(minDurationCell);
                    if (val != 0 || !"".equals(getCellValueAsString(minDurationCell).trim())) {
                        minDurationMinutes = (int) val;
                    }
                }

                if (maxDurationCell != null) {
                    double val = getCellValueAsNumber(maxDurationCell);
                    if (val != 0 || !"".equals(getCellValueAsString(maxDurationCell).trim())) {
                        maxDurationMinutes = (int) val;
                    }
                }

                // Собираем DTO, чтобы переиспользовать одинаковую валидацию
                CreateActivityTypeRequest tmpRequest = new CreateActivityTypeRequest();
                tmpRequest.setName(name);
                tmpRequest.setDescription(description);
                tmpRequest.setDefaultEnergy(defaultEnergy);
                tmpRequest.setEventId(eventId);
                tmpRequest.setTimeLimitRequired(timeLimitRequired);
                tmpRequest.setMinDurationMinutes(minDurationMinutes);
                tmpRequest.setMaxDurationMinutes(maxDurationMinutes);

                try {
                    // Валидация бизнес-логики (ограничения по времени)
                    validateTimeLimits(tmpRequest);
                } catch (RuntimeException e) {
                    errors.add("Строка " + (i + 1) + ": " + e.getMessage());
                    continue;
                }

                // Проверяем, существует ли тип активности с таким именем для этого события
                if (activityTypeRepository.findByNameAndEventId(name, eventId).isPresent()) {
                    errors.add("Строка " + (i + 1) + ": тип активности '" + name + "' уже существует для этого события");
                    continue;
                }
                
                ActivityType activityType = new ActivityType();
                activityType.setName(name);
                activityType.setDescription(description);
                activityType.setDefaultEnergy(defaultEnergy);
                activityType.setEvent(event);
                // применяем ограничения по времени тем же методом, что и при обычном создании
                applyTimeLimits(activityType, tmpRequest);
                
                activityTypes.add(activityType);
            }
        }
        
        if (!activityTypes.isEmpty()) {
            activityTypeRepository.saveAll(activityTypes);
        }
        
        // Если были ошибки, выбрасываем исключение с информацией
        if (!errors.isEmpty()) {
            String errorMessage = "Импортировано: " + activityTypes.size() + ". Ошибки:\n" + 
                String.join("\n", errors);
            throw new RuntimeException(errorMessage);
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
                activityType.getDefaultEnergy(),
                activityType.isTimeLimitRequired(),
                activityType.getMinDurationMinutes(),
                activityType.getMaxDurationMinutes()
        );
    }

    private void validateTimeLimits(CreateActivityTypeRequest request) {
        boolean timeLimitRequired = Boolean.TRUE.equals(request.getTimeLimitRequired());
        Integer min = request.getMinDurationMinutes();
        Integer max = request.getMaxDurationMinutes();

        if (!timeLimitRequired) {
            // when flag is false, we ignore any min/max from client
            return;
        }

        // at least one of min/max must be non-null
        if (min == null && max == null) {
            throw new RuntimeException("При включенном ограничении по времени нужно указать минимум одно из полей: минимальное или максимальное время");
        }

        if (min != null && min < 0) {
            throw new RuntimeException("Минимальное время не может быть отрицательным");
        }
        if (max != null && max < 0) {
            throw new RuntimeException("Максимальное время не может быть отрицательным");
        }
        if (min != null && max != null && min > max) {
            throw new RuntimeException("Минимальное время не может быть больше максимального");
        }
    }

    private void applyTimeLimits(ActivityType activityType, CreateActivityTypeRequest request) {
        boolean timeLimitRequired = Boolean.TRUE.equals(request.getTimeLimitRequired());
        activityType.setTimeLimitRequired(timeLimitRequired);

        if (!timeLimitRequired) {
            activityType.setMinDurationMinutes(null);
            activityType.setMaxDurationMinutes(null);
        } else {
            activityType.setMinDurationMinutes(request.getMinDurationMinutes());
            activityType.setMaxDurationMinutes(request.getMaxDurationMinutes());
        }
    }
}
