package com.app.controller;

import com.app.dto.NotificationResponse;
import com.app.dto.NotificationTemplateRequest;
import com.app.dto.NotificationTemplateResponse;
import com.app.dto.SendNotificationRequest;
import com.app.model.Participant;
import com.app.model.Role;
import com.app.repository.ParticipantRepository;
import com.app.service.NotificationService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/notifications")
@CrossOrigin(origins = "http://localhost:3000")
public class NotificationController {
    
    @Autowired
    private NotificationService notificationService;
    
    @Autowired
    private ParticipantRepository participantRepository;
    
    /**
     * Получить все уведомления текущего пользователя
     * 
     * Возвращает список всех уведомлений (прочитанных и непрочитанных).
     * 
     * @param userDetails данные аутентифицированного пользователя
     * @return список всех уведомлений пользователя
     */
    @GetMapping
    public ResponseEntity<List<NotificationResponse>> getNotifications(
            @AuthenticationPrincipal UserDetails userDetails
    ) {
        Participant participant = participantRepository.findByUsername(userDetails.getUsername())
                .orElseThrow(() -> new RuntimeException("Participant not found"));
        
        List<NotificationResponse> notifications = notificationService.getParticipantNotifications(participant.getId());
        return ResponseEntity.ok(notifications);
    }
    
    /**
     * Получить только непрочитанные уведомления
     * 
     * Возвращает список уведомлений со статусом "непрочитано".
     * 
     * @param userDetails данные аутентифицированного пользователя
     * @return список непрочитанных уведомлений
     */
    @GetMapping("/unread")
    public ResponseEntity<List<NotificationResponse>> getUnreadNotifications(
            @AuthenticationPrincipal UserDetails userDetails
    ) {
        Participant participant = participantRepository.findByUsername(userDetails.getUsername())
                .orElseThrow(() -> new RuntimeException("Participant not found"));
        
        List<NotificationResponse> notifications = notificationService.getUnreadNotifications(participant.getId());
        return ResponseEntity.ok(notifications);
    }
    
    /**
     * Получить количество непрочитанных уведомлений
     * 
     * Возвращает число непрочитанных уведомлений для отображения бейджа.
     * 
     * @param userDetails данные аутентифицированного пользователя
     * @return количество непрочитанных уведомлений
     */
    @GetMapping("/unread/count")
    public ResponseEntity<Long> getUnreadCount(
            @AuthenticationPrincipal UserDetails userDetails
    ) {
        Participant participant = participantRepository.findByUsername(userDetails.getUsername())
                .orElseThrow(() -> new RuntimeException("Participant not found"));
        
        long count = notificationService.getUnreadCount(participant.getId());
        return ResponseEntity.ok(count);
    }
    
    /**
     * Отметить уведомление как прочитанное
     * 
     * Изменяет статус конкретного уведомления на "прочитано".
     * 
     * @param id идентификатор уведомления
     * @param userDetails данные аутентифицированного пользователя
     * @return пустой ответ с кодом 200
     */
    @PutMapping("/{id}/read")
    public ResponseEntity<Void> markAsRead(
            @PathVariable Long id,
            @AuthenticationPrincipal UserDetails userDetails
    ) {
        Participant participant = participantRepository.findByUsername(userDetails.getUsername())
                .orElseThrow(() -> new RuntimeException("Participant not found"));
        
        notificationService.markAsRead(id, participant.getId());
        return ResponseEntity.ok().build();
    }
    
    /**
     * Отметить все уведомления как прочитанные
     * 
     * Изменяет статус всех уведомлений пользователя на "прочитано".
     * 
     * @param userDetails данные аутентифицированного пользователя
     * @return пустой ответ с кодом 200
     */
    @PutMapping("/read-all")
    public ResponseEntity<Void> markAllAsRead(
            @AuthenticationPrincipal UserDetails userDetails
    ) {
        Participant participant = participantRepository.findByUsername(userDetails.getUsername())
                .orElseThrow(() -> new RuntimeException("Participant not found"));
        
        notificationService.markAllAsRead(participant.getId());
        return ResponseEntity.ok().build();
    }
    
    /**
     * Удалить уведомление
     * 
     * Полностью удаляет уведомление из системы.
     * 
     * @param id идентификатор уведомления
     * @param userDetails данные аутентифицированного пользователя
     * @return пустой ответ с кодом 200
     */
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteNotification(
            @PathVariable Long id,
            @AuthenticationPrincipal UserDetails userDetails
    ) {
        Participant participant = participantRepository.findByUsername(userDetails.getUsername())
                .orElseThrow(() -> new RuntimeException("Participant not found"));
        
        notificationService.deleteNotification(id, participant.getId());
        return ResponseEntity.ok().build();
    }
    
    /**
     * Отправить уведомления от администратора (только для админов/модераторов)
     * 
     * Позволяет администратору или модератору отправить уведомление:
     * - Всем пользователям
     * - Конкретной команде
     * - Конкретному событию
     * 
     * @param request данные уведомления (заголовок, текст, целевая аудитория)
     * @param userDetails данные аутентифицированного администратора/модератора
     * @return информация о количестве отправленных уведомлений
     */
    @PostMapping("/admin/send")
    public ResponseEntity<Map<String, Object>> sendAdminNotifications(
            @RequestBody SendNotificationRequest request,
            @AuthenticationPrincipal UserDetails userDetails
    ) {
        Participant participant = participantRepository.findByUsername(userDetails.getUsername())
                .orElseThrow(() -> new RuntimeException("Participant not found"));
        
        if (participant.getRole() != Role.ADMIN && participant.getRole() != Role.MODERATOR) {
            return ResponseEntity.status(403).build();
        }
        
        int count = notificationService.sendAdminNotifications(request);
        
        Map<String, Object> response = new HashMap<>();
        response.put("success", true);
        response.put("count", count);
        response.put("message", "Уведомления отправлены " + count + " участникам");
        
        return ResponseEntity.ok(response);
    }
    
    @PostMapping("/admin/drafts")
    public ResponseEntity<NotificationTemplateResponse> saveDraft(
            @RequestBody NotificationTemplateRequest request,
            @AuthenticationPrincipal UserDetails userDetails
    ) {
        Participant participant = participantRepository.findByUsername(userDetails.getUsername())
                .orElseThrow(() -> new RuntimeException("Participant not found"));
        
        if (participant.getRole() != Role.ADMIN && participant.getRole() != Role.MODERATOR) {
            return ResponseEntity.status(403).build();
        }
        
        NotificationTemplateResponse response = notificationService.saveDraft(request, participant.getId());
        return ResponseEntity.ok(response);
    }
    
    @GetMapping("/admin/drafts/{eventId}")
    public ResponseEntity<List<NotificationTemplateResponse>> getDrafts(
            @PathVariable Long eventId,
            @AuthenticationPrincipal UserDetails userDetails
    ) {
        Participant participant = participantRepository.findByUsername(userDetails.getUsername())
                .orElseThrow(() -> new RuntimeException("Participant not found"));
        
        if (participant.getRole() != Role.ADMIN && participant.getRole() != Role.MODERATOR) {
            return ResponseEntity.status(403).build();
        }
        
        List<NotificationTemplateResponse> drafts = notificationService.getDrafts(eventId);
        return ResponseEntity.ok(drafts);
    }
    
    @GetMapping("/admin/sent/{eventId}")
    public ResponseEntity<List<NotificationTemplateResponse>> getSentNotifications(
            @PathVariable Long eventId,
            @AuthenticationPrincipal UserDetails userDetails
    ) {
        Participant participant = participantRepository.findByUsername(userDetails.getUsername())
                .orElseThrow(() -> new RuntimeException("Participant not found"));
        
        if (participant.getRole() != Role.ADMIN && participant.getRole() != Role.MODERATOR) {
            return ResponseEntity.status(403).build();
        }
        
        List<NotificationTemplateResponse> sent = notificationService.getSentNotifications(eventId);
        return ResponseEntity.ok(sent);
    }
    
    @PostMapping("/admin/templates/{templateId}/send")
    public ResponseEntity<NotificationTemplateResponse> sendFromTemplate(
            @PathVariable Long templateId,
            @AuthenticationPrincipal UserDetails userDetails
    ) {
        Participant participant = participantRepository.findByUsername(userDetails.getUsername())
                .orElseThrow(() -> new RuntimeException("Participant not found"));
        
        if (participant.getRole() != Role.ADMIN && participant.getRole() != Role.MODERATOR) {
            return ResponseEntity.status(403).build();
        }
        
        NotificationTemplateResponse response = notificationService.sendFromTemplate(templateId, participant.getId());
        return ResponseEntity.ok(response);
    }
    
    @DeleteMapping("/admin/templates/{templateId}")
    public ResponseEntity<Void> deleteTemplate(
            @PathVariable Long templateId,
            @AuthenticationPrincipal UserDetails userDetails
    ) {
        Participant participant = participantRepository.findByUsername(userDetails.getUsername())
                .orElseThrow(() -> new RuntimeException("Participant not found"));
        
        if (participant.getRole() != Role.ADMIN && participant.getRole() != Role.MODERATOR) {
            return ResponseEntity.status(403).build();
        }
        
        notificationService.deleteTemplate(templateId);
        return ResponseEntity.ok().build();
    }
}
