package com.app.service;

import com.app.dto.*;
import com.app.model.*;
import com.app.repository.*;
import com.app.repository.EventParticipantRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.List;
import java.util.Set;
import java.util.HashSet;
import java.util.stream.Collectors;

@Service
public class TeamService {
    
    @Autowired
    private TeamRepository teamRepository;
    
    @Autowired
    private TeamParticipantRepository teamParticipantRepository;
    
    @Autowired
    private ParticipantRepository participantRepository;
    
    @Autowired
    private javax.persistence.EntityManager entityManager;
    
    @Autowired
    private ActivityRepository activityRepository;
    
    @Autowired
    private EventParticipantRepository eventParticipantRepository;
    
    /**
     * Получить список всех команд
     * 
     * Возвращает краткую информацию о всех командах в системе.
     * 
     * @return список команд с ID и названием
     */
    public List<TeamListResponse> getAllTeams() {
        return teamRepository.findAll().stream()
                .map(t -> new TeamListResponse(t.getId(), t.getName()))
                .collect(Collectors.toList());
    }
    
    /**
     * Получить команды по ID события
     * 
     * Возвращает список команд, привязанных к конкретному событию.
     * 
     * @param eventId идентификатор события
     * @return список команд события
     */
    public List<TeamListResponse> getTeamsByEventId(Long eventId) {
        return teamRepository.findByEventId(eventId).stream()
                .map(t -> new TeamListResponse(t.getId(), t.getName()))
                .collect(Collectors.toList());
    }
    
    /**
     * Получить детальную информацию о команде
     * 
     * Возвращает полную информацию о команде включая:
     * - Список участников с их ролями
     * - Общее количество баллов
     * - Ранг команды в рейтинге
     * - Привязку к событию
     * 
     * @param id идентификатор команды
     * @return детальная информация о команде
     * @throws RuntimeException если команда не найдена
     */
    public TeamDetailResponse getTeam(Long id) {
        Team team = teamRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Team not found"));
        
        List<TeamParticipant> teamParticipants = teamParticipantRepository.findByTeamId(id);
        
        List<TeamParticipantDto> participants = teamParticipants.stream()
                .map(tp -> new TeamParticipantDto(
                        tp.getParticipant().getId(),
                        tp.getParticipant().getName(),
                        tp.getRole().getName()
                ))
                .collect(Collectors.toList());
        
        Integer totalPoints = teamParticipantRepository.getTotalPointsByTeamId(id);
        if (totalPoints == null) {
            totalPoints = 0;
        }
        
        Integer rank = calculateRank(id, totalPoints);
        
        Long eventId = team.getEvent() != null ? team.getEvent().getId() : null;
        
        return new TeamDetailResponse(
                team.getId(),
                team.getName(),
                team.getMotto(),
                team.getImageUrl(),
                totalPoints,
                rank,
                participants,
                eventId
        );
    }
    
    /**
     * Создать новую команду
     * 
     * Создает команду с автоматическим назначением создателя капитаном.
     * Автоматически привязывает команду к активному событию, если создатель
     * принял приглашение в событие.
     * 
     * Может добавить дополнительных участников при создании.
     * Проверяет, что участники еще не состоят в других командах.
     * 
     * @param request данные для создания команды (название, девиз, участники)
     * @param creatorId ID создателя команды
     * @return созданная команда
     * @throws RuntimeException если создатель/участник не найден или участник уже в команде
     */
    @Transactional
    public Team createTeam(CreateTeamRequest request, Long creatorId) {
        Participant creator = participantRepository.findById(creatorId)
                .orElseThrow(() -> new RuntimeException("Creator not found"));
        
        Team team = new Team();
        team.setName(request.getName());
        team.setMotto(request.getMotto());
        
        // Автоматически привязываем команду к мероприятию, если пользователь принял приглашение
        List<EventParticipant> acceptedInvitations = eventParticipantRepository
                .findByParticipantIdAndStatus(creatorId, EventParticipantStatus.ACCEPTED);
        
        if (!acceptedInvitations.isEmpty()) {
            // Выбираем активное мероприятие, если есть, иначе самое последнее по дате начала
            Event selectedEvent = acceptedInvitations.stream()
                    .map(EventParticipant::getEvent)
                    .filter(event -> event != null)
                    .filter(event -> event.getStatus() == EventStatus.ACTIVE)
                    .findFirst()
                    .orElseGet(() -> 
                        acceptedInvitations.stream()
                            .map(EventParticipant::getEvent)
                            .filter(event -> event != null)
                            .max((e1, e2) -> e1.getStartDate().compareTo(e2.getStartDate()))
                            .orElse(null)
                    );
            
            if (selectedEvent != null) {
                team.setEvent(selectedEvent);
            }
        }
        
        team = teamRepository.save(team);
        
        TeamParticipant creatorParticipant = new TeamParticipant();
        creatorParticipant.setTeam(team);
        creatorParticipant.setParticipant(creator);
        creatorParticipant.setRole(TeamRole.CAPTAIN);
        teamParticipantRepository.save(creatorParticipant);
        
        if (request.getParticipantIds() != null) {
            for (Long participantId : request.getParticipantIds()) {
                if (!participantId.equals(creatorId)) {
                    Participant participant = participantRepository.findById(participantId)
                            .orElseThrow(() -> new RuntimeException("Participant not found: " + participantId));
                    
                    // Check if participant is already in a team
                    List<TeamParticipant> existingTeams = teamParticipantRepository.findByParticipantId(participantId);
                    if (!existingTeams.isEmpty()) {
                        throw new RuntimeException("Participant " + participant.getName() + " is already in a team");
                    }
                    
                    TeamParticipant tp = new TeamParticipant();
                    tp.setTeam(team);
                    tp.setParticipant(participant);
                    tp.setRole(TeamRole.PARTICIPANT);
                    teamParticipantRepository.save(tp);
                }
            }
        }
        
        return team;
    }
    
    /**
     * Обновить информацию о команде
     * 
     * Обновляет название, девиз и изображение команды.
     * Все поля опциональны - обновляются только переданные значения.
     * 
     * @param id идентификатор команды
     * @param request данные для обновления
     * @return обновленная команда
     * @throws RuntimeException если команда не найдена
     */
    @Transactional
    public Team updateTeam(Long id, UpdateTeamRequest request) {
        Team team = teamRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Team not found"));
        
        if (request.getName() != null) {
            team.setName(request.getName());
        }
        if (request.getMotto() != null) {
            team.setMotto(request.getMotto());
        }
        if (request.getImageUrl() != null) {
            team.setImageUrl(request.getImageUrl());
        }
        
        return teamRepository.save(team);
    }
    
    /**
     * Удалить команду
     * 
     * Полностью удаляет команду из системы.
     * Каскадно удаляются все связанные данные (участники команды, активности и т.д.).
     * 
     * @param id идентификатор команды
     */
    @Transactional
    public void deleteTeam(Long id) {
        teamRepository.deleteById(id);
    }
    
    /**
     * Обновить изображение команды
     * 
     * Устанавливает новое изображение для команды.
     * 
     * @param id идентификатор команды
     * @param imageUrl URL загруженного изображения
     * @throws RuntimeException если команда не найдена
     */
    @Transactional
    public void updateTeamImage(Long id, String imageUrl) {
        Team team = teamRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Team not found"));
        team.setImageUrl(imageUrl);
        teamRepository.save(team);
    }
    
    /**
     * Покинуть команду
     * 
     * Удаляет участника из команды.
     * 
     * @param teamId идентификатор команды
     * @param participantId идентификатор участника
     */
    @Transactional
    public void leaveTeam(Long teamId, Long participantId) {
        teamParticipantRepository.deleteByTeamIdAndParticipantId(teamId, participantId);
    }
    
    /**
     * Добавить участника в команду
     * 
     * Добавляет нового участника в команду с ролью PARTICIPANT.
     * Проверяет, что участник еще не состоит в другой команде.
     * 
     * @param teamId идентификатор команды
     * @param participantId идентификатор участника
     * @throws RuntimeException если команда или участник не найдены, или участник уже в команде
     */
    @Transactional
    public void addParticipant(Long teamId, Long participantId) {
        Team team = teamRepository.findById(teamId)
                .orElseThrow(() -> new RuntimeException("Team not found"));
        
        Participant participant = participantRepository.findById(participantId)
                .orElseThrow(() -> new RuntimeException("Participant not found"));
        
        // Проверяем, не состоит ли участник уже в команде этого мероприятия
        if (team.getEvent() != null) {
            List<TeamParticipant> existingTeams = teamParticipantRepository.findByParticipantId(participantId);
            for (TeamParticipant tp : existingTeams) {
                if (tp.getTeam().getEvent() != null && 
                    tp.getTeam().getEvent().getId().equals(team.getEvent().getId())) {
                    throw new RuntimeException("Participant is already in another team for this event");
                }
            }
        }
        
        TeamParticipant teamParticipant = new TeamParticipant();
        teamParticipant.setTeam(team);
        teamParticipant.setParticipant(participant);
        teamParticipant.setRole(TeamRole.PARTICIPANT);
        teamParticipantRepository.save(teamParticipant);
    }
    
    /**
     * Удалить участника из команды
     * 
     * Удаляет участника из команды.
     * 
     * @param teamId идентификатор команды
     * @param participantId идентификатор участника
     */
    @Transactional
    public void removeParticipant(Long teamId, Long participantId) {
        teamParticipantRepository.deleteByTeamIdAndParticipantId(teamId, participantId);
    }
    
    /**
     * Получить список участников команды
     * 
     * Возвращает всех участников команды с их ролями.
     * 
     * @param teamId идентификатор команды
     * @return список участников с ID, именем и ролью
     */
    public List<TeamParticipantDto> getTeamParticipants(Long teamId) {
        return teamParticipantRepository.findByTeamId(teamId).stream()
                .map(tp -> new TeamParticipantDto(
                        tp.getParticipant().getId(),
                        tp.getParticipant().getName(),
                        tp.getRole().getName()
                ))
                .collect(Collectors.toList());
    }
    
    /**
     * Получить рейтинг всех команд
     * 
     * Возвращает список всех команд, отсортированный по общему количеству баллов.
     * Для каждой команды рассчитывается ранг на основе баллов.
     * 
     * @return список команд с рейтингом, отсортированный по баллам (убывание)
     */
    public List<TeamRankingResponse> getTeamRankings() {
        List<Team> teams = teamRepository.findAll();
        List<TeamRankingResponse> rankings = new ArrayList<>();
        
        for (Team team : teams) {
            Integer totalPoints = teamParticipantRepository.getTotalPointsByTeamId(team.getId());
            if (totalPoints == null) {
                totalPoints = 0;
            }
            
            int participantCount = teamParticipantRepository.findByTeamId(team.getId()).size();
            
            rankings.add(new TeamRankingResponse(
                    team.getId(),
                    team.getName(),
                    totalPoints,
                    participantCount,
                    0
            ));
        }
        
        rankings.sort(Comparator.comparing(TeamRankingResponse::getTotalPoints).reversed());
        
        for (int i = 0; i < rankings.size(); i++) {
            rankings.get(i).setRank(i + 1);
        }
        
        return rankings;
    }
    
    /**
     * Рассчитать ранг команды
     * 
     * Определяет позицию команды в рейтинге на основе общего количества баллов.
     * Команды с большим количеством баллов имеют более высокий ранг (меньшее число).
     * 
     * @param teamId идентификатор команды
     * @param totalPoints общее количество баллов команды
     * @return ранг команды (1 = лучшая команда)
     */
    private Integer calculateRank(Long teamId, Integer totalPoints) {
        List<Team> allTeams = teamRepository.findAll();
        int rank = 1;
        
        for (Team team : allTeams) {
            if (!team.getId().equals(teamId)) {
                Integer teamPoints = teamParticipantRepository.getTotalPointsByTeamId(team.getId());
                if (teamPoints == null) {
                    teamPoints = 0;
                }
                if (teamPoints > totalPoints) {
                    rank++;
                }
            }
        }
        
        return rank;
    }
    
    /**
     * Получить статистику регулярности активностей команд
     * 
     * Рассчитывает для каждой команды:
     * - Текущую серию (streak) - количество дней подряд с активностями
     * - Общее количество активных дней
     * - Календарь активности за последние 14 дней
     * - Общее количество баллов и ранг
     * 
     * Серия считается активной если есть активность сегодня или вчера.
     * 
     * @return список команд со статистикой регулярности, отсортированный по баллам
     */
    public List<TeamRegularityResponse> getTeamRegularityStats() {
        List<Team> teams = teamRepository.findAll();
        List<TeamRegularityResponse> regularityStats = new ArrayList<>();
        
        for (Team team : teams) {
            Integer totalPoints = teamParticipantRepository.getTotalPointsByTeamId(team.getId());
            if (totalPoints == null) {
                totalPoints = 0;
            }
            
            int participantCount = teamParticipantRepository.findByTeamId(team.getId()).size();
            
            // Получаем все активности команды
            List<Activity> activities = activityRepository.findByTeamIdOrderByCreatedAtDesc(team.getId());
            
            // Собираем уникальные даты активностей
            Set<LocalDate> activityDates = new HashSet<>();
            for (Activity activity : activities) {
                activityDates.add(activity.getCreatedAt().toLocalDate());
            }
            
            // Подсчитываем текущую серию (streak)
            int currentStreak = 0;
            LocalDate today = LocalDate.now();
            LocalDate checkDate = today;
            
            while (activityDates.contains(checkDate)) {
                currentStreak++;
                checkDate = checkDate.minusDays(1);
            }
            
            // Если сегодня нет активности, проверяем вчера
            if (currentStreak == 0 && activityDates.contains(today.minusDays(1))) {
                checkDate = today.minusDays(1);
                while (activityDates.contains(checkDate)) {
                    currentStreak++;
                    checkDate = checkDate.minusDays(1);
                }
            }
            
            // Подсчитываем активные дни
            int activeDays = activityDates.size();
            
            // Формируем календарь последних 14 дней
            List<Boolean> last14Days = new ArrayList<>();
            for (int i = 13; i >= 0; i--) {
                LocalDate date = today.minusDays(i);
                last14Days.add(activityDates.contains(date));
            }
            
            regularityStats.add(new TeamRegularityResponse(
                    team.getId(),
                    team.getName(),
                    totalPoints,
                    participantCount,
                    0, // rank будет установлен позже
                    currentStreak,
                    activeDays,
                    last14Days
            ));
        }
        
        // Сортируем по баллам и устанавливаем ранги
        regularityStats.sort(Comparator.comparing(TeamRegularityResponse::getTotalPoints).reversed());
        
        for (int i = 0; i < regularityStats.size(); i++) {
            regularityStats.get(i).setRank(i + 1);
        }
        
        return regularityStats;
    }
}
