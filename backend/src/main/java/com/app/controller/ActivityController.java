package com.app.controller;

import com.app.dto.ActivityResponse;
import com.app.dto.CreateActivityResponse;
import com.app.model.Participant;
import com.app.repository.ParticipantRepository;
import com.app.service.ActivityService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api")
@CrossOrigin(origins = "http://localhost:3000")
public class ActivityController {
    
    @Autowired
    private ActivityService activityService;
    
    @Autowired
    private ParticipantRepository participantRepository;
    
    /**
     * Получить все активности в системе с пагинацией
     * 
     * Возвращает список всех активностей с поддержкой пагинации.
     * Для каждой активности включает информацию о реакциях текущего пользователя.
     * 
     * @param page номер страницы (начиная с 0)
     * @param size количество элементов на странице
     * @param userDetails данные аутентифицированного пользователя
     * @return список активностей с информацией о реакциях
     */
    @GetMapping("/activities/all")
    public ResponseEntity<List<ActivityResponse>> getAllActivities(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(required = false) Long eventId,
            @AuthenticationPrincipal UserDetails userDetails) {
        Long currentUserId = getCurrentUserId(userDetails);
        List<ActivityResponse> activities;
        if (eventId != null) {
            activities = activityService.getEventActivities(eventId, currentUserId, page, size);
        } else {
            activities = activityService.getAllActivities(currentUserId, page, size);
        }
        return ResponseEntity.ok(activities);
    }
    
    /**
     * Получить одну активность по ID
     * 
     * Возвращает детальную информацию об активности, включая:
     * - Основные данные активности
     * - Информацию об участниках
     * - Фотографии
     * - Реакции текущего пользователя
     * 
     * @param id идентификатор активности
     * @param userDetails данные аутентифицированного пользователя
     * @return детальная информация об активности
     */
    @GetMapping("/activities/{id}")
    public ResponseEntity<ActivityResponse> getActivityById(
            @PathVariable Long id,
            @AuthenticationPrincipal UserDetails userDetails) {
        Long currentUserId = getCurrentUserId(userDetails);
        ActivityResponse activity = activityService.getActivityById(id, currentUserId);
        return ResponseEntity.ok(activity);
    }
    
    /**
     * Получить все активности конкретной команды
     * 
     * Возвращает список всех активностей, созданных командой.
     * Используется для отображения ленты активностей команды.
     * 
     * @param teamId идентификатор команды
     * @param userDetails данные аутентифицированного пользователя
     * @return список активностей команды
     */
    @GetMapping("/teams/{teamId}/activities")
    public ResponseEntity<List<ActivityResponse>> getTeamActivities(
            @PathVariable Long teamId,
            @AuthenticationPrincipal UserDetails userDetails) {
        Long currentUserId = getCurrentUserId(userDetails);
        List<ActivityResponse> activities = activityService.getTeamActivities(teamId, currentUserId);
        return ResponseEntity.ok(activities);
    }
    
    /**
     * Создать новую активность с фото (опционально)
     * 
     * Создает новую активность для команды. Поддерживает:
     * - Загрузку нескольких фотографий
     * - Добавление нескольких участников
     * - Указание типа активности и затраченной энергии
     * - Опциональное описание и длительность
     * 
     * Если событие требует модерации, активность создается со статусом PENDING.
     * В противном случае - сразу APPROVED.
     * 
     * @param teamId идентификатор команды
     * @param participantId идентификатор создателя активности
     * @param type тип активности
     * @param energy количество энергии/баллов
     * @param description описание активности (опционально)
     * @param durationMinutes длительность в минутах (опционально)
     * @param photos список фотографий (опционально)
     * @param participantIds список ID дополнительных участников (опционально)
     * @return информация о созданной активности
     */
    @PostMapping("/activities")
    public ResponseEntity<CreateActivityResponse> createActivity(
            @RequestParam Long teamId,
            @RequestParam Long participantId,
            @RequestParam String type,
            @RequestParam Integer energy,
            @RequestParam(required = false) String description,
            @RequestParam(required = false) Integer durationMinutes,
            @RequestParam(required = false) List<MultipartFile> photos,
            @RequestParam(required = false) List<Long> participantIds) {
        CreateActivityResponse response = activityService.createActivity(
                teamId, participantId, type, energy, description, durationMinutes, photos, participantIds);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }
    
    /**
     * Покинуть активность (удалить себя из участников)
     * 
     * Позволяет участнику удалить себя из списка участников активности.
     * Используется когда участник был добавлен по ошибке или хочет выйти.
     * 
     * @param id идентификатор активности
     * @param userDetails данные аутентифицированного пользователя
     * @return пустой ответ с кодом 200
     */
    @PostMapping("/activities/{id}/leave")
    public ResponseEntity<Void> leaveActivity(
            @PathVariable Long id,
            @AuthenticationPrincipal UserDetails userDetails) {
        Long currentUserId = getCurrentUserId(userDetails);
        activityService.leaveActivity(id, currentUserId);
        return ResponseEntity.ok().build();
    }
    
    /**
     * Вспомогательный метод для получения ID текущего пользователя
     * 
     * @param userDetails данные аутентифицированного пользователя
     * @return ID пользователя или null если не аутентифицирован
     */
    private Long getCurrentUserId(UserDetails userDetails) {
        if (userDetails == null) {
            return null;
        }
        Optional<Participant> participant = participantRepository.findByUsername(userDetails.getUsername());
        return participant.map(Participant::getId).orElse(null);
    }
}
