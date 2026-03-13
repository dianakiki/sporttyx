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
import com.app.repository.EventParticipantRepository;
import com.app.repository.ParticipantRepository;
import com.app.repository.TeamParticipantRepository;
import com.app.repository.TeamRepository;
import com.app.model.EventParticipant;
import com.app.model.EventParticipantStatus;
import com.app.model.TeamParticipant;
import com.app.model.TeamRole;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.Arrays;
import java.util.Comparator;
import java.util.List;
import java.util.Map;
import java.util.Optional;
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
    
    @Autowired
    private EventParticipantRepository eventParticipantRepository;
    
    @Autowired
    private TeamParticipantRepository teamParticipantRepository;
    
    /**
     * Получить все активности команды
     * 
     * Возвращает активности со статусами APPROVED, AUTO_APPROVED и PENDING.
     * Включает информацию о реакциях текущего пользователя.
     * 
     * @param teamId идентификатор команды
     * @param currentUserId ID текущего пользователя для получения его реакций
     * @return список активностей команды
     */
    public List<ActivityResponse> getTeamActivities(Long teamId, Long currentUserId) {
        List<ActivityStatus> allowedStatuses = Arrays.asList(
            ActivityStatus.APPROVED, 
            ActivityStatus.AUTO_APPROVED, 
            ActivityStatus.PENDING
        );
        return activityRepository.findByTeamIdWithAdjustments(teamId, allowedStatuses).stream()
                .sorted(Comparator.comparing(Activity::getCreatedAt).reversed())
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
     * Получить активности пользователя по мероприятию
     * 
     * Возвращает все активности (включая ожидающие модерации) текущего пользователя для конкретного мероприятия.
     * 
     * @param participantId ID участника
     * @param eventId ID мероприятия
     * @param currentUserId ID текущего пользователя для получения его реакций
     * @return список активностей пользователя по мероприятию
     */
    public List<ActivityResponse> getParticipantEventActivities(Long participantId, Long eventId, Long currentUserId) {
        List<ActivityStatus> allStatuses = Arrays.asList(
            ActivityStatus.PENDING, 
            ActivityStatus.APPROVED, 
            ActivityStatus.AUTO_APPROVED, 
            ActivityStatus.REJECTED
        );
        
        // Get all activities for participant with adjustments, then filter by event
        List<Activity> allParticipantActivities = activityRepository.findByParticipantIdOrderByCreatedAtDesc(participantId);
        
        return allParticipantActivities.stream()
                .filter(a -> {
                    // Check if activity belongs to the event
                    Event activityEvent = null;
                    if (a.getTeam() != null && a.getTeam().getEvent() != null) {
                        activityEvent = a.getTeam().getEvent();
                    } else if (a.getActivityType() != null && a.getActivityType().getEvent() != null) {
                        activityEvent = a.getActivityType().getEvent();
                    }
                    return activityEvent != null && activityEvent.getId().equals(eventId);
                })
                .filter(a -> allStatuses.contains(a.getStatus()))
                .sorted(Comparator.comparing(Activity::getCreatedAt).reversed())
                .map(a -> {
                    // Load adjustments if needed
                    Activity withAdjustments = activityRepository.findByIdWithAdjustments(a.getId());
                    return toActivityResponse(withAdjustments != null ? withAdjustments : a, currentUserId);
                })
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
                                                  Integer energy, String description, Integer durationMinutes, LocalDate reportDate, List<MultipartFile> photos, List<Long> participantIds) {
        // Validate photo count
        if (photos != null && photos.size() > 10) {
            throw new RuntimeException("Maximum 10 photos allowed per activity");
        }
        
        Participant participant = participantRepository.findById(participantId)
                .orElseThrow(() -> new RuntimeException("Participant not found"));
        
        ActivityType activityType = activityTypeRepository.findByName(type)
                .orElseThrow(() -> new RuntimeException("Activity type not found: " + type));
        
        Team team;
        Event event;
        
        // If teamId is not provided, handle individual events
        if (teamId == null) {
            // Get event from activity type
            event = activityType.getEvent();
            if (event == null) {
                throw new RuntimeException("Activity type must be associated with an event");
            }
            
            // Check if event is individual (not team-based)
            if (event.getTeamBasedCompetition() != null && event.getTeamBasedCompetition()) {
                throw new RuntimeException("Team ID is required for team-based events");
            }
            
            // For individual events, team is not required
            team = null;
        } else {
            team = teamRepository.findById(teamId)
                    .orElseThrow(() -> new RuntimeException("Team not found"));
            event = team.getEvent();
        }
        
        // Validate duration against activity type limits if event tracks duration
        validateDurationAgainstLimits(event, activityType, durationMinutes);
        
        // Validate photo requirement based on event settings
        validateArtifactsRequirement(event, photos);

        Activity activity = new Activity();
        activity.setTeam(team); // Can be null for individual events
        activity.setParticipant(participant);
        activity.setActivityType(activityType);
        activity.setEnergy(energy);
        activity.setDescription(description);
        activity.setDurationMinutes(durationMinutes);
        activity.setReportDate(reportDate); // Can be null, defaults to null if not provided
        
        // Get event from activityType if team is null
        if (event == null) {
            event = activityType.getEvent();
        }
        
        // Calculate points based on event settings
        if (event != null && event.getTrackActivityDuration() != null && event.getTrackActivityDuration() 
                && durationMinutes != null && durationMinutes > 0) {
            // If trackActivityDuration is true: points = energy * durationMinutes / 60
            activity.setPoints((long) (energy * durationMinutes / 60));
        } else {
            // If trackActivityDuration is false: points = energy
            activity.setPoints((long) energy);
        }
        
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
     * Обновить существующую активность
     * 
     * Обновляет активность только если она находится в статусе PENDING.
     * Если активность уже одобрена (APPROVED, AUTO_APPROVED), редактирование запрещено.
     * 
     * @param activityId ID активности для обновления
     * @param participantId ID создателя активности (для проверки прав)
     * @param type тип активности
     * @param energy количество энергии/баллов
     * @param description описание активности (опционально)
     * @param durationMinutes длительность в минутах (опционально)
     * @param photos список файлов фотографий (максимум 10)
     * @param participantIds список ID дополнительных участников
     * @return информация о обновленной активности
     * @throws RuntimeException если активность не найдена, уже одобрена или нет прав на редактирование
     */
    @Transactional
    public CreateActivityResponse updateActivity(Long activityId, Long participantId, String type, 
                                                  Integer energy, String description, Integer durationMinutes, LocalDate reportDate,
                                                  List<MultipartFile> photos, List<Long> participantIds) {
        Activity activity = activityRepository.findById(activityId)
                .orElseThrow(() -> new RuntimeException("Activity not found"));
        
        // Проверка роли пользователя - админы могут редактировать всегда
        Participant participant = participantRepository.findById(participantId)
                .orElseThrow(() -> new RuntimeException("Participant not found"));
        boolean isAdmin = participant.getRole() == com.app.model.Role.ADMIN;
        
        // Если не админ, проверяем блокировку
        if (!isAdmin) {
            // Проверка, что активность в статусе PENDING
            if (activity.getStatus() != ActivityStatus.PENDING) {
                throw new RuntimeException("Activity can only be edited when status is PENDING");
            }
            
            // Проверка блокировки по времени
            Event event = null;
            if (activity.getTeam() != null && activity.getTeam().getEvent() != null) {
                event = activity.getTeam().getEvent();
            } else if (activity.getActivityType() != null && activity.getActivityType().getEvent() != null) {
                event = activity.getActivityType().getEvent();
            }
            
            if (event != null && event.getActivityBlockingEnabled() != null && event.getActivityBlockingEnabled()) {
                LocalDate activityDate = activity.getReportDate() != null ? activity.getReportDate() : activity.getCreatedAt().toLocalDate();
                LocalDate currentDate = LocalDate.now();
                Integer blockingDays = event.getActivityBlockingDays();
                
                if (blockingDays != null && blockingDays > 0) {
                    LocalDate blockingThreshold = currentDate.minusDays(blockingDays);
                    if (activityDate.isBefore(blockingThreshold) || activityDate.isEqual(blockingThreshold)) {
                        throw new RuntimeException("Активность заблокирована для редактирования. Срок редактирования истек.");
                    }
                }
            }
        }
        
        // Проверка прав на редактирование:
        // 1. Пользователь является создателем активности
        // 2. ИЛИ пользователь является капитаном команды, к которой принадлежит активность
        // 3. ИЛИ пользователь является админом
        boolean isCreator = activity.getParticipant().getId().equals(participantId);
        boolean isCaptain = false;
        
        if (!isCreator && activity.getTeam() != null) {
            // Проверяем, является ли пользователь капитаном команды
            Optional<TeamParticipant> teamParticipant = teamParticipantRepository
                    .findByTeamIdAndParticipantId(activity.getTeam().getId(), participantId);
            if (teamParticipant.isPresent() && teamParticipant.get().getRole() == TeamRole.CAPTAIN) {
                isCaptain = true;
            }
        }
        
        if (!isCreator && !isCaptain && !isAdmin) {
            throw new RuntimeException("Only activity creator or team captain can edit the activity");
        }
        
        // Validate photo count
        if (photos != null && photos.size() > 10) {
            throw new RuntimeException("Maximum 10 photos allowed per activity");
        }
        
        ActivityType activityType = activityTypeRepository.findByName(type)
                .orElseThrow(() -> new RuntimeException("Activity type not found: " + type));
        
        // Get event from activity
        Event event = null;
        if (activity.getTeam() != null && activity.getTeam().getEvent() != null) {
            event = activity.getTeam().getEvent();
        } else if (activityType.getEvent() != null) {
            event = activityType.getEvent();
        }
        
        // Validate duration against activity type limits if event tracks duration
        validateDurationAgainstLimits(event, activityType, durationMinutes);

        // Update activity fields
        activity.setActivityType(activityType);
        activity.setEnergy(energy);
        activity.setDescription(description);
        activity.setDurationMinutes(durationMinutes);
        activity.setReportDate(reportDate); // Can be null
        
        // Calculate points based on event settings
        if (event != null && event.getTrackActivityDuration() != null && event.getTrackActivityDuration() 
                && durationMinutes != null && durationMinutes > 0) {
            // If trackActivityDuration is true: points = energy * durationMinutes / 60
            activity.setPoints((long) (energy * durationMinutes / 60));
        } else {
            // If trackActivityDuration is false: points = energy
            activity.setPoints((long) energy);
        }
        
        // Update activity participants
        if (participantIds != null && !participantIds.isEmpty()) {
            // Remove existing participants (except creator)
            activity.getActivityParticipants().removeIf(ap -> !ap.getParticipant().getId().equals(participantId));
            
            // Add new participants
            for (Long pId : participantIds) {
                if (pId.equals(participantId)) {
                    continue; // Skip creator
                }
                Participant p = participantRepository.findById(pId)
                        .orElseThrow(() -> new RuntimeException("Participant not found: " + pId));
                
                ActivityParticipant ap = new ActivityParticipant();
                ap.setActivity(activity);
                ap.setParticipant(p);
                activity.getActivityParticipants().add(ap);
            }
        }
        
        // Update photos
        if (photos != null && !photos.isEmpty()) {
            // Delete existing photos
            activityPhotoRepository.deleteByActivityId(activityId);
            activity.setPhotoUrl(null);
            
            // Add new photos
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
        }
        
        activity = activityRepository.save(activity);
        
        return new CreateActivityResponse(
                activity.getId(),
                activity.getActivityType().getName(),
                activity.getEnergy(),
                activity.getCreatedAt()
        );
    }

    /**
     * Проверка необходимости приложить артефакты (фото) для мероприятия.
     *
     * Если у события установлен флаг artifactsRequired = true, то при создании
     * активности хотя бы одно фото обязательно.
     */
    private void validateArtifactsRequirement(Event event, List<MultipartFile> photos) {
        if (event == null || event.getArtifactsRequired() == null || !event.getArtifactsRequired()) {
            return;
        }

        boolean hasPhotos = photos != null && photos.stream()
                .anyMatch(p -> p != null && !p.isEmpty());

        if (!hasPhotos) {
            throw new RuntimeException("Необходимо приложить артефакты, подтверждающие вашу спортивную активность");
        }
    }

    /**
     * Проверка, укладывается ли указанная длительность в ограничения типа активности.
     *
     * Правила:
     * - Проверка выполняется только если event.trackActivityDuration == true и durationMinutes != null.
     * - Если для типа активности timeLimitRequired == true:
     *   - Если minDurationMinutes != null и duration < min -> ошибка.
     *   - Если maxDurationMinutes != null и duration > max -> ошибка.
     * - Если min/max == null, считаем, что нижней/верхней границы нет.
     */
    private void validateDurationAgainstLimits(Event event, ActivityType activityType, Integer durationMinutes) {
        if (event == null || event.getTrackActivityDuration() == null || !event.getTrackActivityDuration()) {
            return; // проверка только для мероприятий с включённым учётом времени
        }
        if (durationMinutes == null) {
            return; // без времени нечего проверять
        }

        if (activityType == null || !activityType.isTimeLimitRequired()) {
            return; // для типа без ограничения по времени ничего не проверяем
        }

        Integer min = activityType.getMinDurationMinutes();
        Integer max = activityType.getMaxDurationMinutes();

        if (min != null && durationMinutes < min) {
            throw new RuntimeException("Время активности меньше минимально допустимого для данного типа (минимальное время равно " + min + " мин).");
        }
        if (max != null && durationMinutes > max) {
            throw new RuntimeException("Время активности больше максимально допустимого для данного типа (максимальное время равно " + max + " мин).");
        }
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
        
        // Get event from team or activityType
        Event event = null;
        if (a.getTeam() != null && a.getTeam().getEvent() != null) {
            event = a.getTeam().getEvent();
        } else if (a.getActivityType() != null && a.getActivityType().getEvent() != null) {
            event = a.getActivityType().getEvent();
        }
        
        Boolean teamBased = event != null && event.getTeamBasedCompetition() != null 
                ? event.getTeamBasedCompetition() 
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
        
        Long eventId = event != null ? event.getId() : null;
        String eventName = event != null ? event.getName() : null;
        
        // Calculate final points including bonus/penalty adjustments
        // Use points field if available, otherwise fallback to energy
        Integer finalPoints = a.getPoints() != null ? a.getPoints().intValue() : a.getEnergy();
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
        
        // Calculate blocking information
        Boolean isBlockedForEditing = false;
        Long secondsUntilBlocking = null;
        
        if (event != null && event.getActivityBlockingEnabled() != null && event.getActivityBlockingEnabled()) {
            LocalDate activityDate = a.getReportDate() != null ? a.getReportDate() : a.getCreatedAt().toLocalDate();
            LocalDate currentDate = LocalDate.now();
            Integer blockingDays = event.getActivityBlockingDays();
            
            if (blockingDays != null && blockingDays > 0) {
                // Calculate blocking threshold date (current date - blocking days)
                LocalDate blockingThreshold = currentDate.minusDays(blockingDays);
                
                // Check if activity is already blocked
                if (activityDate.isBefore(blockingThreshold) || activityDate.isEqual(blockingThreshold)) {
                    isBlockedForEditing = true;
                } else {
                    // Calculate seconds until blocking
                    // Blocking happens at 00:00 of the day when activityDate becomes <= blockingThreshold
                    // So if activityDate is today, blocking happens tomorrow at 00:00
                    // If activityDate is yesterday, blocking happens today at 00:00
                    LocalDate blockingDate = activityDate.plusDays(blockingDays);
                    LocalDateTime blockingDateTime = blockingDate.atStartOfDay();
                    LocalDateTime now = LocalDateTime.now();
                    
                    if (blockingDateTime.isAfter(now)) {
                        secondsUntilBlocking = java.time.Duration.between(now, blockingDateTime).getSeconds();
                    } else {
                        isBlockedForEditing = true;
                    }
                }
            }
        }
        
        // Also block if status is APPROVED (except for admins, but we check that on backend)
        if (a.getStatus() == ActivityStatus.APPROVED) {
            isBlockedForEditing = true;
            secondsUntilBlocking = null;
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
                a.getReportDate(),
                a.getTeam() != null ? a.getTeam().getId() : null,
                a.getTeam() != null ? a.getTeam().getName() : null,
                a.getTeam() != null ? a.getTeam().getImageUrl() : null,
                eventId,
                eventName,
                teamBased,
                reactionCounts,
                userReaction,
                totalReactions,
                commentCount,
                a.getStatus() != null ? a.getStatus().name() : null,
                isBlockedForEditing,
                secondsUntilBlocking
        );
        
        return response;
    }
}
