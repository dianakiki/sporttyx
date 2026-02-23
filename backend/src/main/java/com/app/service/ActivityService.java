package com.app.service;

import com.app.dto.ActivityHeatmapResponse;
import com.app.dto.ActivityResponse;
import com.app.dto.CreateActivityResponse;
import com.app.model.Activity;
import com.app.model.ActivityParticipant;
import com.app.model.ActivityPhoto;
import com.app.model.ActivityStatus;
import com.app.model.ActivityType;
import com.app.model.Event;
import com.app.model.Participant;
import com.app.model.Team;
import com.app.repository.ActivityPhotoRepository;
import com.app.repository.ActivityRepository;
import com.app.repository.ActivityTypeRepository;
import com.app.repository.ParticipantRepository;
import com.app.repository.TeamRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.time.LocalDateTime;
import java.util.Arrays;
import java.util.Comparator;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
public class ActivityService {
    
    @Autowired
    private ActivityRepository activityRepository;
    
    @Autowired
    private TeamRepository teamRepository;
    
    @Autowired
    private ParticipantRepository participantRepository;
    
    @Autowired
    private ActivityTypeRepository activityTypeRepository;
    
    @Autowired
    private ImageService imageService;
    
    @Autowired
    private ActivityPhotoRepository activityPhotoRepository;
    
    @Autowired
    private ActivityReactionService activityReactionService;
    
    @Autowired
    private ActivityCommentService activityCommentService;
    
    /**
     * Получить все активности команды
     * 
     * Возвращает только одобренные активности (APPROVED, AUTO_APPROVED).
     * Включает информацию о реакциях текущего пользователя.
     * 
     * @param teamId идентификатор команды
     * @param currentUserId ID текущего пользователя для получения его реакций
     * @return список активностей команды
     */
    public List<ActivityResponse> getTeamActivities(Long teamId, Long currentUserId) {
        List<ActivityStatus> approvedStatuses = Arrays.asList(ActivityStatus.APPROVED, ActivityStatus.AUTO_APPROVED);
        return activityRepository.findByTeamIdWithAdjustments(teamId, approvedStatuses).stream()
                .map(a -> toActivityResponse(a, currentUserId))
                .collect(Collectors.toList());
    }
    
    /**
     * Получить все активности в системе
     * 
     * Возвращает все одобренные активности, отсортированные по дате создания (новые первыми).
     * 
     * @param currentUserId ID текущего пользователя для получения его реакций
     * @return список всех активностей
     */
    public List<ActivityResponse> getAllActivities(Long currentUserId) {
        List<ActivityStatus> approvedStatuses = Arrays.asList(ActivityStatus.APPROVED, ActivityStatus.AUTO_APPROVED);
        return activityRepository.findAllWithAdjustmentsByStatusIn(approvedStatuses).stream()
                .sorted(Comparator.comparing(Activity::getCreatedAt).reversed())
                .map(a -> toActivityResponse(a, currentUserId))
                .collect(Collectors.toList());
    }
    
    /**
     * Получить все активности с пагинацией
     * 
     * Возвращает одобренные активности с поддержкой пагинации.
     * 
     * @param currentUserId ID текущего пользователя
     * @param page номер страницы (начиная с 0)
     * @param size размер страницы
     * @return список активностей для указанной страницы
     */
    public List<ActivityResponse> getAllActivities(Long currentUserId, int page, int size) {
        List<ActivityStatus> approvedStatuses = Arrays.asList(ActivityStatus.APPROVED, ActivityStatus.AUTO_APPROVED);
        return activityRepository.findAllWithAdjustmentsByStatusIn(approvedStatuses).stream()
                .sorted(Comparator.comparing(Activity::getCreatedAt).reversed())
                .skip((long) page * size)
                .limit(size)
                .map(a -> toActivityResponse(a, currentUserId))
                .collect(Collectors.toList());
    }
    
    /**
     * Получить активности мероприятия с пагинацией
     * 
     * Возвращает одобренные активности для конкретного мероприятия с поддержкой пагинации.
     * 
     * @param eventId ID мероприятия
     * @param currentUserId ID текущего пользователя
     * @param page номер страницы (начиная с 0)
     * @param size размер страницы
     * @return список активностей для указанной страницы
     */
    public List<ActivityResponse> getEventActivities(Long eventId, Long currentUserId, int page, int size) {
        List<ActivityStatus> approvedStatuses = Arrays.asList(ActivityStatus.APPROVED, ActivityStatus.AUTO_APPROVED);
        return activityRepository.findByEventIdWithAdjustments(eventId, approvedStatuses).stream()
                .sorted(Comparator.comparing(Activity::getCreatedAt).reversed())
                .skip((long) page * size)
                .limit(size)
                .map(a -> toActivityResponse(a, currentUserId))
                .collect(Collectors.toList());
    }
    
    /**
     * Получить активность по ID
     * 
     * Возвращает детальную информацию об активности, включая все фото,
     * участников, реакции и комментарии.
     * 
     * @param id идентификатор активности
     * @param currentUserId ID текущего пользователя
     * @return детальная информация об активности
     * @throws RuntimeException если активность не найдена
     */
    public ActivityResponse getActivityById(Long id, Long currentUserId) {
        Activity a = activityRepository.findByIdWithAdjustments(id);
        if (a == null) {
            throw new RuntimeException("Activity not found");
        }
        
        return toActivityResponse(a, currentUserId);
    }
    
    /**
     * Создать новую активность
     * 
     * Создает активность для команды с поддержкой:
     * - Загрузки до 10 фотографий
     * - Добавления нескольких участников
     * - Автоматической модерации (если требуется для события)
     * 
     * Если событие требует модерации, активность создается со статусом PENDING,
     * иначе - AUTO_APPROVED.
     * 
     * @param teamId ID команды
     * @param participantId ID создателя активности
     * @param type тип активности
     * @param energy количество энергии/баллов
     * @param description описание активности
     * @param durationMinutes длительность в минутах
     * @param photos список файлов фотографий (максимум 10)
     * @param participantIds список ID дополнительных участников
     * @return информация о созданной активности
     * @throws RuntimeException если превышен лимит фото, команда/участник не найдены
     */
    public CreateActivityResponse createActivity(Long teamId, Long participantId, String type, 
                                                  Integer energy, String description, Integer durationMinutes, List<MultipartFile> photos, List<Long> participantIds) {
        // Validate photo count
        if (photos != null && photos.size() > 10) {
            throw new RuntimeException("Maximum 10 photos allowed per activity");
        }
        
        Team team = teamRepository.findById(teamId)
                .orElseThrow(() -> new RuntimeException("Team not found"));
        
        Participant participant = participantRepository.findById(participantId)
                .orElseThrow(() -> new RuntimeException("Participant not found"));
        
        ActivityType activityType = activityTypeRepository.findByName(type)
                .orElseThrow(() -> new RuntimeException("Activity type not found: " + type));
        
        Activity activity = new Activity();
        activity.setTeam(team);
        activity.setParticipant(participant);
        activity.setActivityType(activityType);
        activity.setEnergy(energy);
        activity.setDescription(description);
        activity.setDurationMinutes(durationMinutes);
        
        Event event = team.getEvent();
        if (event != null && event.getRequiresActivityApproval()) {
            activity.setStatus(ActivityStatus.PENDING);
        } else {
            activity.setStatus(ActivityStatus.AUTO_APPROVED);
        }
        
        activity = activityRepository.save(activity);
        
        // Save activity participants if provided
        if (participantIds != null && !participantIds.isEmpty()) {
            for (Long pId : participantIds) {
                Participant p = participantRepository.findById(pId)
                        .orElseThrow(() -> new RuntimeException("Participant not found: " + pId));
                
                ActivityParticipant ap = new ActivityParticipant();
                ap.setActivity(activity);
                ap.setParticipant(p);
                activity.getActivityParticipants().add(ap);
            }
            activityRepository.save(activity);
        }
        
        if (photos != null && !photos.isEmpty()) {
            int order = 0;
            for (MultipartFile photo : photos) {
                if (photo != null && !photo.isEmpty()) {
                    try {
                        String photoUrl = imageService.saveActivityImage(photo);
                        
                        ActivityPhoto activityPhoto = new ActivityPhoto();
                        activityPhoto.setActivity(activity);
                        activityPhoto.setPhotoUrl(photoUrl);
                        activityPhoto.setDisplayOrder(order++);
                        activityPhotoRepository.save(activityPhoto);
                        
                        if (activity.getPhotoUrl() == null) {
                            activity.setPhotoUrl(photoUrl);
                        }
                    } catch (IOException e) {
                        System.err.println("Failed to save activity photo: " + e.getMessage());
                        e.printStackTrace();
                        throw new RuntimeException("Failed to save activity photo: " + e.getMessage(), e);
                    }
                }
            }
            activityRepository.save(activity);
        }
        
        return new CreateActivityResponse(
                activity.getId(),
                activity.getActivityType().getName(),
                activity.getEnergy(),
                activity.getCreatedAt()
        );
    }
    
    /**
     * Получить тепловую карту активностей команды
     * 
     * Возвращает статистику активностей по дням за последние 90 дней.
     * Используется для визуализации активности команды в календаре.
     * 
     * @param teamId идентификатор команды
     * @return список дат с количеством активностей
     */
    public List<ActivityHeatmapResponse> getTeamActivityHeatmap(Long teamId) {
        LocalDateTime threeMonthsAgo = LocalDateTime.now().minusDays(90);
        List<Activity> activities = activityRepository.findByTeamIdAndCreatedAtAfter(teamId, threeMonthsAgo);
        
        // Group activities by date
        Map<String, Integer> activityCountByDate = activities.stream()
                .collect(Collectors.groupingBy(
                        a -> a.getCreatedAt().toLocalDate().toString(),
                        Collectors.summingInt(a -> 1)
                ));
        
        // Convert to response list
        return activityCountByDate.entrySet().stream()
                .map(entry -> new ActivityHeatmapResponse(entry.getKey(), entry.getValue()))
                .sorted(Comparator.comparing(ActivityHeatmapResponse::getDate))
                .collect(Collectors.toList());
    }
    
    /**
     * Покинуть активность (удалить себя из участников)
     * 
     * Удаляет участника из списка участников активности.
     * 
     * @param activityId ID активности
     * @param participantId ID участника
     * @throws RuntimeException если активность не найдена
     */
    public void leaveActivity(Long activityId, Long participantId) {
        Activity activity = activityRepository.findById(activityId)
                .orElseThrow(() -> new RuntimeException("Activity not found"));
        
        activity.getActivityParticipants().removeIf(ap -> 
            ap.getParticipant().getId().equals(participantId));
        
        activityRepository.save(activity);
    }
    
    /**
     * Преобразовать Activity в ActivityResponse
     * 
     * Формирует полный ответ с:
     * - Списком всех фотографий
     * - Информацией о реакциях и комментариях
     * - Финальными баллами с учетом бонусов/штрафов
     * - Реакцией текущего пользователя
     * 
     * Финальные баллы рассчитываются как базовая энергия + бонусы - штрафы.
     * Минимальное значение финальных баллов - 0.
     * 
     * @param a объект активности
     * @param currentUserId ID текущего пользователя
     * @return DTO с полной информацией об активности
     */
    public ActivityResponse toActivityResponse(Activity a, Long currentUserId) {
        List<String> photoUrls = a.getPhotos().stream()
                .map(ActivityPhoto::getPhotoUrl)
                .collect(Collectors.toList());
        
        Boolean teamBased = a.getTeam() != null && a.getTeam().getEvent() != null 
                ? a.getTeam().getEvent().getTeamBasedCompetition() 
                : true;
        
        Map<String, Integer> reactionCounts = activityReactionService.getReactionCounts(a.getId());
        String userReaction = null;
        if (currentUserId != null) {
            var reactionResponse = activityReactionService.getActivityReactions(a.getId(), currentUserId);
            userReaction = reactionResponse.getUserReaction();
        }
        Integer totalReactions = activityReactionService.getTotalReactions(a.getId());
        Long commentCountLong = activityCommentService.getCommentCount(a.getId());
        Integer commentCount = commentCountLong != null ? commentCountLong.intValue() : 0;
        
        Long eventId = null;
        String eventName = null;
        if (a.getTeam() != null && a.getTeam().getEvent() != null) {
            eventId = a.getTeam().getEvent().getId();
            eventName = a.getTeam().getEvent().getName();
        }
        
        // Calculate final points including bonus/penalty adjustments
        Integer finalPoints = a.getEnergy();
        if (a.getAdjustments() != null && !a.getAdjustments().isEmpty()) {
            for (var adjustment : a.getAdjustments()) {
                if (adjustment.getBonusType() != null) {
                    // Both bonuses (positive) and penalties (negative) are added
                    finalPoints += adjustment.getBonusType().getPointsAdjustment();
                }
            }
        }
        
        // Ensure finalPoints doesn't go below 0
        if (finalPoints < 0) {
            finalPoints = 0;
        }
        
        ActivityResponse response = new ActivityResponse(
                a.getId(),
                a.getActivityType().getName(),
                a.getEnergy(),
                finalPoints,
                a.getDurationMinutes(),
                a.getDescription(),
                a.getParticipant().getName(),
                a.getParticipant().getId(),
                a.getParticipant().getProfileImageUrl(),
                a.getPhotoUrl(),
                photoUrls,
                a.getCreatedAt(),
                a.getTeam() != null ? a.getTeam().getId() : null,
                a.getTeam() != null ? a.getTeam().getName() : null,
                a.getTeam() != null ? a.getTeam().getImageUrl() : null,
                eventId,
                eventName,
                teamBased,
                reactionCounts,
                userReaction,
                totalReactions,
                commentCount
        );
        
        return response;
    }
}
