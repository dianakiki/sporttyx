package com.app.controller;

import com.app.dto.ActivityTypeResponse;
import com.app.dto.CreateActivityTypeRequest;
import com.app.service.ActivityTypeService;
import org.apache.poi.ss.usermodel.*;
import org.apache.poi.xssf.usermodel.XSSFWorkbook;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/activity-types")
@CrossOrigin(origins = "http://localhost:3000")
public class ActivityTypeController {
    
    @Autowired
    private ActivityTypeService activityTypeService;
    
    /**
     * Получить все типы активностей или типы для конкретного события
     */
    @GetMapping
    public ResponseEntity<List<ActivityTypeResponse>> getAllActivityTypes(
            @RequestParam(required = false) Long eventId) {
        if (eventId != null) {
            return ResponseEntity.ok(activityTypeService.getActivityTypesByEventId(eventId));
        }
        return ResponseEntity.ok(activityTypeService.getAllActivityTypes());
    }
    
    /**
     * Получить тип активности по ID
     */
    @GetMapping("/{id}")
    public ResponseEntity<ActivityTypeResponse> getActivityTypeById(@PathVariable Long id) {
        return ResponseEntity.ok(activityTypeService.getActivityTypeById(id));
    }
    
    /**
     * Создать новый тип активности
     */
    @PostMapping
    public ResponseEntity<ActivityTypeResponse> createActivityType(@RequestBody CreateActivityTypeRequest request) {
        return ResponseEntity.ok(activityTypeService.createActivityType(request));
    }
    
    /**
     * Обновить существующий тип активности
     */
    @PutMapping("/{id}")
    public ResponseEntity<ActivityTypeResponse> updateActivityType(
            @PathVariable Long id,
            @RequestBody CreateActivityTypeRequest request) {
        return ResponseEntity.ok(activityTypeService.updateActivityType(id, request));
    }
    
    /**
     * Удалить тип активности
     */
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteActivityType(@PathVariable Long id) {
        activityTypeService.deleteActivityType(id);
        return ResponseEntity.ok().build();
    }
    
    /**
     * Импортировать типы активностей из Excel файла
     */
    @PostMapping("/import")
    public ResponseEntity<Map<String, Object>> importActivityTypes(
            @RequestParam("file") MultipartFile file,
            @RequestParam("eventId") Long eventId) {
        try {
            // Проверка формата файла
            String filename = file.getOriginalFilename();
            if (filename == null || !filename.toLowerCase().endsWith(".xlsx")) {
                Map<String, Object> error = new HashMap<>();
                error.put("success", false);
                error.put("message", "Поддерживается только формат .xlsx");
                return ResponseEntity.badRequest().body(error);
            }
            
            int count = activityTypeService.importFromExcel(file, eventId);
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("message", "Успешно импортировано " + count + " типов активностей");
            response.put("count", count);
            return ResponseEntity.ok(response);
        } catch (RuntimeException e) {
            Map<String, Object> error = new HashMap<>();
            error.put("success", false);
            error.put("message", e.getMessage());
            return ResponseEntity.badRequest().body(error);
        } catch (Exception e) {
            Map<String, Object> error = new HashMap<>();
            error.put("success", false);
            error.put("message", "Ошибка при импорте: " + e.getMessage());
            return ResponseEntity.badRequest().body(error);
        }
    }
    
    /**
     * Скачать шаблон Excel файла для импорта типов активностей
     */
    @GetMapping("/template")
    public ResponseEntity<byte[]> downloadTemplate() {
        try {
            Workbook workbook = new XSSFWorkbook();
            Sheet sheet = workbook.createSheet("Типы активностей");
            
            // Создаем стиль для заголовков
            CellStyle headerStyle = workbook.createCellStyle();
            Font headerFont = workbook.createFont();
            headerFont.setBold(true);
            headerFont.setFontHeightInPoints((short) 12);
            headerStyle.setFont(headerFont);
            headerStyle.setFillForegroundColor(IndexedColors.LIGHT_BLUE.getIndex());
            headerStyle.setFillPattern(FillPatternType.SOLID_FOREGROUND);
            headerStyle.setBorderBottom(BorderStyle.THIN);
            headerStyle.setBorderTop(BorderStyle.THIN);
            headerStyle.setBorderLeft(BorderStyle.THIN);
            headerStyle.setBorderRight(BorderStyle.THIN);
            headerStyle.setAlignment(HorizontalAlignment.CENTER);
            
            // Создаем стиль для данных
            CellStyle dataStyle = workbook.createCellStyle();
            dataStyle.setBorderBottom(BorderStyle.THIN);
            dataStyle.setBorderTop(BorderStyle.THIN);
            dataStyle.setBorderLeft(BorderStyle.THIN);
            dataStyle.setBorderRight(BorderStyle.THIN);
            
            // Создаем строку заголовков
            Row headerRow = sheet.createRow(0);
            String[] headers = {"Название", "Описание", "Баллы"};
            
            for (int i = 0; i < headers.length; i++) {
                Cell cell = headerRow.createCell(i);
                cell.setCellValue(headers[i]);
                cell.setCellStyle(headerStyle);
            }
            
            // Добавляем примеры данных
            String[][] examples = {
                {"Бег 5 км", "Пробежать 5 километров", "10"},
                {"Плавание", "Проплыть 500 метров", "15"},
                {"Велосипед", "Проехать 10 км на велосипеде", "12"}
            };
            
            for (int i = 0; i < examples.length; i++) {
                Row row = sheet.createRow(i + 1);
                for (int j = 0; j < examples[i].length; j++) {
                    Cell cell = row.createCell(j);
                    if (j == 2) { // Столбец с баллами
                        cell.setCellValue(Integer.parseInt(examples[i][j]));
                    } else {
                        cell.setCellValue(examples[i][j]);
                    }
                    cell.setCellStyle(dataStyle);
                }
            }
            
            // Автоматически подгоняем ширину столбцов
            for (int i = 0; i < headers.length; i++) {
                sheet.autoSizeColumn(i);
                // Устанавливаем минимальную ширину
                int columnWidth = sheet.getColumnWidth(i);
                sheet.setColumnWidth(i, Math.max(columnWidth, 3000));
            }
            
            // Записываем в байтовый массив
            ByteArrayOutputStream outputStream = new ByteArrayOutputStream();
            workbook.write(outputStream);
            workbook.close();
            
            byte[] bytes = outputStream.toByteArray();
            
            HttpHeaders httpHeaders = new HttpHeaders();
            httpHeaders.setContentType(MediaType.APPLICATION_OCTET_STREAM);
            httpHeaders.setContentDispositionFormData("attachment", "template_activity_types.xlsx");
            httpHeaders.setContentLength(bytes.length);
            
            return ResponseEntity.ok()
                    .headers(httpHeaders)
                    .body(bytes);
                    
        } catch (IOException e) {
            return ResponseEntity.internalServerError().build();
        }
    }
}
