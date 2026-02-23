package com.app.controller;

import com.app.dto.BugReportRequest;
import com.app.dto.BugReportResponse;
import com.app.dto.ParticipantBadgeResponse;
import com.app.model.Participant;
import com.app.repository.ParticipantRepository;
import com.app.service.BadgeService;
import com.app.service.BugReportService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api")
@CrossOrigin(origins = "http://localhost:3000")
public class BugReportController {
    
    @Autowired
    private BugReportService bugReportService;
    
    @Autowired
    private BadgeService badgeService;
    
    @Autowired
    private ParticipantRepository participantRepository;
    
    /**
     * Создать новый отчет об ошибке
     * 
     * Позволяет пользователю сообщить об ошибке или проблеме в системе.
     * Создатель отчета автоматически получает статус репортера.
     * 
     * @param request данные отчета (заголовок, описание, приоритет)
     * @param userDetails данные аутентифицированного пользователя
     * @return созданный отчет об ошибке
     */
    @PostMapping("/bug-reports")
    public ResponseEntity<BugReportResponse> createBugReport(
            @RequestBody BugReportRequest request,
            @AuthenticationPrincipal UserDetails userDetails) {
        Long participantId = getCurrentUserId(userDetails);
        BugReportResponse response = bugReportService.createBugReport(participantId, request);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }
    
    /**
     * Получить все отчеты об ошибках текущего пользователя
     * 
     * Возвращает список всех отчетов, созданных текущим пользователем.
     * 
     * @param userDetails данные аутентифицированного пользователя
     * @return список отчетов пользователя
     */
    @GetMapping("/bug-reports/my")
    public ResponseEntity<List<BugReportResponse>> getMyBugReports(
            @AuthenticationPrincipal UserDetails userDetails) {
        Long participantId = getCurrentUserId(userDetails);
        List<BugReportResponse> reports = bugReportService.getUserBugReports(participantId);
        return ResponseEntity.ok(reports);
    }
    
    /**
     * Получить все отчеты об ошибках (только для администраторов)
     * 
     * Возвращает полный список всех отчетов об ошибках в системе.
     * Доступно только администраторам для управления и модерации.
     * 
     * @return список всех отчетов об ошибках
     */
    @GetMapping("/admin/bug-reports")
    public ResponseEntity<List<BugReportResponse>> getAllBugReports() {
        List<BugReportResponse> reports = bugReportService.getAllBugReports();
        return ResponseEntity.ok(reports);
    }
    
    /**
     * Обновить статус отчета об ошибке (только для администраторов)
     * 
     * Позволяет администратору изменить статус отчета (OPEN, IN_PROGRESS, RESOLVED, CLOSED).
     * Опционально можно добавить заметки администратора и наградить пользователя значком
     * за полезный отчет об ошибке.
     * 
     * @param id идентификатор отчета
     * @param status новый статус отчета
     * @param adminNotes заметки администратора (опционально)
     * @param awardBadge наградить ли пользователя значком (опционально)
     * @param userDetails данные аутентифицированного администратора
     * @return обновленный отчет об ошибке
     */
    @PutMapping("/admin/bug-reports/{id}")
    public ResponseEntity<BugReportResponse> updateBugReportStatus(
            @PathVariable Long id,
            @RequestParam String status,
            @RequestParam(required = false) String adminNotes,
            @RequestParam(required = false) Boolean awardBadge,
            @AuthenticationPrincipal UserDetails userDetails) {
        Long adminId = getCurrentUserId(userDetails);
        BugReportResponse response = bugReportService.updateBugReportStatus(id, status, adminId, adminNotes, awardBadge);
        return ResponseEntity.ok(response);
    }
    
    /**
     * Удалить отчет об ошибке (только для администраторов)
     * 
     * Полностью удаляет отчет об ошибке из системы.
     * 
     * @param id идентификатор отчета
     * @return пустой ответ с кодом 200
     */
    @DeleteMapping("/admin/bug-reports/{id}")
    public ResponseEntity<Void> deleteBugReport(@PathVariable Long id) {
        bugReportService.deleteBugReport(id);
        return ResponseEntity.ok().build();
    }
    
    /**
     * Получить все значки участника
     * 
     * Возвращает список всех значков, полученных участником.
     * Включает информацию о дате получения и типе значка.
     * 
     * @param id идентификатор участника
     * @return список значков участника
     */
    @GetMapping("/participants/{id}/badges")
    public ResponseEntity<List<ParticipantBadgeResponse>> getParticipantBadges(@PathVariable Long id) {
        List<ParticipantBadgeResponse> badges = badgeService.getParticipantBadges(id);
        return ResponseEntity.ok(badges);
    }
    
    private Long getCurrentUserId(UserDetails userDetails) {
        if (userDetails == null) {
            return null;
        }
        Optional<Participant> participant = participantRepository.findByUsername(userDetails.getUsername());
        return participant.map(Participant::getId).orElse(null);
    }
}
