# План реализации роли МОДЕРАТОР и кабинета модерации

## Текущее состояние системы

### Существующие роли
```java
public enum Role {
    ADMIN,  // Полный доступ к системе
    USER    // Обычный пользователь
}
```

### Текущий флаг модерации
В модели `Event` есть поле:
```java
@Column(name = "requires_activity_approval", nullable = false)
private Boolean requiresActivityApproval = false;
```

**Проблема**: Флаг есть, но нет механизма модерации и статусов активностей.

---

## Концепция системы модерации

### Роль MODERATOR

**Права модератора:**
- Просмотр всех активностей, ожидающих модерации
- Одобрение активностей (засчитывание баллов)
- Отклонение активностей с указанием причины
- Просмотр истории модерации
- Фильтрация по мероприятиям, командам, статусам

**Ограничения:**
- Не может создавать/редактировать мероприятия (это ADMIN)
- Не может управлять пользователями
- Не может изменять типы активностей

### Статусы активностей

```java
public enum ActivityStatus {
    PENDING,    // Ожидает модерации (по умолчанию если requiresActivityApproval = true)
    APPROVED,   // Одобрена модератором, баллы засчитаны
    REJECTED,   // Отклонена модератором
    AUTO_APPROVED  // Автоматически одобрена (если requiresActivityApproval = false)
}
```

### Логика работы

1. **Создание активности:**
   - Если `event.requiresActivityApproval == true` → статус `PENDING`
   - Если `event.requiresActivityApproval == false` → статус `AUTO_APPROVED`

2. **Подсчет баллов:**
   - Баллы засчитываются только для активностей со статусом `APPROVED` или `AUTO_APPROVED`
   - Активности `PENDING` и `REJECTED` не учитываются в рейтинге

3. **Модерация:**
   - Модератор видит только активности со статусом `PENDING`
   - При одобрении: `PENDING` → `APPROVED` + уведомление пользователю
   - При отклонении: `PENDING` → `REJECTED` + причина + уведомление

---

## Изменения в базе данных

### 1. Обновление enum Role

```sql
-- Миграция: 019-add-moderator-role.yaml
ALTER TYPE role ADD VALUE 'MODERATOR';
```

### 2. Добавление статуса и модерации в activities

```sql
-- Миграция: 020-add-activity-moderation.yaml
CREATE TYPE activity_status AS ENUM ('PENDING', 'APPROVED', 'REJECTED', 'AUTO_APPROVED');

ALTER TABLE activities 
ADD COLUMN status activity_status NOT NULL DEFAULT 'AUTO_APPROVED',
ADD COLUMN moderated_by BIGINT REFERENCES participants(id),
ADD COLUMN moderated_at TIMESTAMP,
ADD COLUMN rejection_reason TEXT;

CREATE INDEX idx_activities_status ON activities(status);
CREATE INDEX idx_activities_moderated_by ON activities(moderated_by);
```

### 3. Таблица истории модерации (опционально)

```sql
-- Для аудита и статистики
CREATE TABLE moderation_history (
    id BIGSERIAL PRIMARY KEY,
    activity_id BIGINT NOT NULL REFERENCES activities(id) ON DELETE CASCADE,
    moderator_id BIGINT NOT NULL REFERENCES participants(id),
    action VARCHAR(20) NOT NULL, -- 'APPROVED', 'REJECTED'
    reason TEXT,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_moderation_history_activity_id ON moderation_history(activity_id);
CREATE INDEX idx_moderation_history_moderator_id ON moderation_history(moderator_id);
```

---

## Backend реализация

### 1. Обновление модели Activity

```java
@Entity
@Table(name = "activities")
public class Activity {
    // ... существующие поля
    
    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private ActivityStatus status = ActivityStatus.AUTO_APPROVED;
    
    @ManyToOne
    @JoinColumn(name = "moderated_by")
    private Participant moderatedBy;
    
    @Column(name = "moderated_at")
    private LocalDateTime moderatedAt;
    
    @Column(name = "rejection_reason", columnDefinition = "TEXT")
    private String rejectionReason;
}
```

### 2. Enum ActivityStatus

```java
package com.app.model;

public enum ActivityStatus {
    PENDING,         // Ожидает модерации
    APPROVED,        // Одобрена
    REJECTED,        // Отклонена
    AUTO_APPROVED    // Автоматически одобрена
}
```

### 3. Обновление Role enum

```java
public enum Role {
    ADMIN,
    MODERATOR,  // Новая роль
    USER
}
```

### 4. ModerationService

```java
@Service
public class ModerationService {
    
    @Autowired
    private ActivityRepository activityRepository;
    
    @Autowired
    private ParticipantRepository participantRepository;
    
    /**
     * Получить активности на модерацию
     */
    public List<ActivityModerationResponse> getPendingActivities(
            Long eventId, 
            Long teamId,
            int page, 
            int size
    ) {
        Pageable pageable = PageRequest.of(page, size, Sort.by("createdAt").descending());
        
        Specification<Activity> spec = (root, query, cb) -> {
            List<Predicate> predicates = new ArrayList<>();
            predicates.add(cb.equal(root.get("status"), ActivityStatus.PENDING));
            
            if (eventId != null) {
                predicates.add(cb.equal(root.get("team").get("event").get("id"), eventId));
            }
            if (teamId != null) {
                predicates.add(cb.equal(root.get("team").get("id"), teamId));
            }
            
            return cb.and(predicates.toArray(new Predicate[0]));
        };
        
        return activityRepository.findAll(spec, pageable)
                .map(this::toModerationResponse)
                .getContent();
    }
    
    /**
     * Одобрить активность
     */
    @Transactional
    public void approveActivity(Long activityId, Long moderatorId) {
        Activity activity = activityRepository.findById(activityId)
                .orElseThrow(() -> new RuntimeException("Activity not found"));
        
        if (activity.getStatus() != ActivityStatus.PENDING) {
            throw new RuntimeException("Activity is not pending moderation");
        }
        
        Participant moderator = participantRepository.findById(moderatorId)
                .orElseThrow(() -> new RuntimeException("Moderator not found"));
        
        if (moderator.getRole() != Role.MODERATOR && moderator.getRole() != Role.ADMIN) {
            throw new RuntimeException("User is not a moderator");
        }
        
        activity.setStatus(ActivityStatus.APPROVED);
        activity.setModeratedBy(moderator);
        activity.setModeratedAt(LocalDateTime.now());
        activity.setRejectionReason(null);
        
        activityRepository.save(activity);
        
        // TODO: Отправить уведомление пользователю
    }
    
    /**
     * Отклонить активность
     */
    @Transactional
    public void rejectActivity(Long activityId, Long moderatorId, String reason) {
        Activity activity = activityRepository.findById(activityId)
                .orElseThrow(() -> new RuntimeException("Activity not found"));
        
        if (activity.getStatus() != ActivityStatus.PENDING) {
            throw new RuntimeException("Activity is not pending moderation");
        }
        
        Participant moderator = participantRepository.findById(moderatorId)
                .orElseThrow(() -> new RuntimeException("Moderator not found"));
        
        if (moderator.getRole() != Role.MODERATOR && moderator.getRole() != Role.ADMIN) {
            throw new RuntimeException("User is not a moderator");
        }
        
        activity.setStatus(ActivityStatus.REJECTED);
        activity.setModeratedBy(moderator);
        activity.setModeratedAt(LocalDateTime.now());
        activity.setRejectionReason(reason);
        
        activityRepository.save(activity);
        
        // TODO: Отправить уведомление пользователю
    }
    
    /**
     * Получить статистику модерации
     */
    public ModerationStatsResponse getModerationStats(Long moderatorId) {
        // Количество ожидающих модерации
        long pendingCount = activityRepository.countByStatus(ActivityStatus.PENDING);
        
        // Статистика модератора
        long approvedByModerator = activityRepository.countByModeratedByIdAndStatus(
                moderatorId, ActivityStatus.APPROVED);
        long rejectedByModerator = activityRepository.countByModeratedByIdAndStatus(
                moderatorId, ActivityStatus.REJECTED);
        
        return new ModerationStatsResponse(
                pendingCount,
                approvedByModerator,
                rejectedByModerator
        );
    }
}
```

### 5. ModerationController

```java
@RestController
@RequestMapping("/api/moderation")
@CrossOrigin(origins = "http://localhost:3000")
public class ModerationController {
    
    @Autowired
    private ModerationService moderationService;
    
    /**
     * Получить активности на модерацию
     */
    @GetMapping("/activities/pending")
    @PreAuthorize("hasAnyRole('MODERATOR', 'ADMIN')")
    public ResponseEntity<List<ActivityModerationResponse>> getPendingActivities(
            @RequestParam(required = false) Long eventId,
            @RequestParam(required = false) Long teamId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size
    ) {
        List<ActivityModerationResponse> activities = moderationService.getPendingActivities(
                eventId, teamId, page, size);
        return ResponseEntity.ok(activities);
    }
    
    /**
     * Одобрить активность
     */
    @PostMapping("/activities/{id}/approve")
    @PreAuthorize("hasAnyRole('MODERATOR', 'ADMIN')")
    public ResponseEntity<Void> approveActivity(
            @PathVariable Long id,
            @AuthenticationPrincipal UserDetails userDetails
    ) {
        Long moderatorId = getCurrentUserId(userDetails);
        moderationService.approveActivity(id, moderatorId);
        return ResponseEntity.ok().build();
    }
    
    /**
     * Отклонить активность
     */
    @PostMapping("/activities/{id}/reject")
    @PreAuthorize("hasAnyRole('MODERATOR', 'ADMIN')")
    public ResponseEntity<Void> rejectActivity(
            @PathVariable Long id,
            @RequestBody RejectActivityRequest request,
            @AuthenticationPrincipal UserDetails userDetails
    ) {
        Long moderatorId = getCurrentUserId(userDetails);
        moderationService.rejectActivity(id, moderatorId, request.getReason());
        return ResponseEntity.ok().build();
    }
    
    /**
     * Получить статистику модерации
     */
    @GetMapping("/stats")
    @PreAuthorize("hasAnyRole('MODERATOR', 'ADMIN')")
    public ResponseEntity<ModerationStatsResponse> getStats(
            @AuthenticationPrincipal UserDetails userDetails
    ) {
        Long moderatorId = getCurrentUserId(userDetails);
        ModerationStatsResponse stats = moderationService.getModerationStats(moderatorId);
        return ResponseEntity.ok(stats);
    }
}
```

### 6. DTO классы

```java
// ActivityModerationResponse.java
@Data
@AllArgsConstructor
public class ActivityModerationResponse {
    private Long id;
    private String type;
    private Integer energy;
    private String participantName;
    private Long participantId;
    private String teamName;
    private Long teamId;
    private String eventName;
    private Long eventId;
    private List<String> photoUrls;
    private ActivityStatus status;
    private LocalDateTime createdAt;
}

// RejectActivityRequest.java
@Data
public class RejectActivityRequest {
    @NotBlank(message = "Reason is required")
    @Size(max = 500, message = "Reason must be less than 500 characters")
    private String reason;
}

// ModerationStatsResponse.java
@Data
@AllArgsConstructor
public class ModerationStatsResponse {
    private Long pendingCount;
    private Long approvedByMe;
    private Long rejectedByMe;
}
```

### 7. Обновление ActivityService

```java
// При создании активности
public CreateActivityResponse createActivity(...) {
    // ... существующий код
    
    // Определяем статус на основе настроек мероприятия
    Event event = team.getEvent();
    if (event != null && event.getRequiresActivityApproval()) {
        activity.setStatus(ActivityStatus.PENDING);
    } else {
        activity.setStatus(ActivityStatus.AUTO_APPROVED);
    }
    
    activity = activityRepository.save(activity);
    // ...
}

// Обновить методы подсчета баллов - учитывать только APPROVED и AUTO_APPROVED
public List<ActivityResponse> getTeamActivities(Long teamId) {
    return activityRepository.findByTeamIdAndStatusIn(
            teamId, 
            Arrays.asList(ActivityStatus.APPROVED, ActivityStatus.AUTO_APPROVED),
            Sort.by("createdAt").descending()
    );
}
```

### 8. Обновление ActivityRepository

```java
public interface ActivityRepository extends JpaRepository<Activity, Long>, JpaSpecificationExecutor<Activity> {
    
    List<Activity> findByTeamIdAndStatusInOrderByCreatedAtDesc(
            Long teamId, 
            List<ActivityStatus> statuses
    );
    
    long countByStatus(ActivityStatus status);
    
    long countByModeratedByIdAndStatus(Long moderatorId, ActivityStatus status);
    
    // Для подсчета баллов команды
    @Query("SELECT SUM(a.energy) FROM Activity a WHERE a.team.id = :teamId AND a.status IN :statuses")
    Integer sumEnergyByTeamIdAndStatusIn(
            @Param("teamId") Long teamId, 
            @Param("statuses") List<ActivityStatus> statuses
    );
}
```

---

## Frontend реализация

### 1. Кабинет модератора (ModerationPanel.tsx)

```tsx
interface ModerationPanelProps {}

export const ModerationPanel: React.FC = () => {
    const [activities, setActivities] = useState<ActivityModeration[]>([]);
    const [stats, setStats] = useState<ModerationStats | null>(null);
    const [filters, setFilters] = useState({
        eventId: null,
        teamId: null,
        page: 0
    });
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        fetchPendingActivities();
        fetchStats();
    }, [filters]);

    const fetchPendingActivities = async () => {
        try {
            const token = localStorage.getItem('token');
            const params = new URLSearchParams({
                page: filters.page.toString(),
                size: '20'
            });
            if (filters.eventId) params.append('eventId', filters.eventId);
            if (filters.teamId) params.append('teamId', filters.teamId);

            const response = await fetch(`/api/moderation/activities/pending?${params}`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });

            if (response.ok) {
                const data = await response.json();
                setActivities(data);
            }
        } catch (err) {
            console.error('Error fetching activities:', err);
        } finally {
            setIsLoading(false);
        }
    };

    const handleApprove = async (activityId: number) => {
        try {
            const token = localStorage.getItem('token');
            const response = await fetch(`/api/moderation/activities/${activityId}/approve`, {
                method: 'POST',
                headers: { 'Authorization': `Bearer ${token}` }
            });

            if (response.ok) {
                // Удалить из списка
                setActivities(prev => prev.filter(a => a.id !== activityId));
                // Обновить статистику
                fetchStats();
            }
        } catch (err) {
            console.error('Error approving activity:', err);
        }
    };

    const handleReject = async (activityId: number, reason: string) => {
        try {
            const token = localStorage.getItem('token');
            const response = await fetch(`/api/moderation/activities/${activityId}/reject`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ reason })
            });

            if (response.ok) {
                setActivities(prev => prev.filter(a => a.id !== activityId));
                fetchStats();
            }
        } catch (err) {
            console.error('Error rejecting activity:', err);
        }
    };

    return (
        <div className="min-h-screen p-6">
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <div className="mb-8">
                    <h1 className="text-4xl font-bold text-slate-900 mb-2">
                        Модерация активностей
                    </h1>
                    <p className="text-slate-600">
                        Проверка и одобрение активностей участников
                    </p>
                </div>

                {/* Stats */}
                {stats && (
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                        <StatCard
                            title="На модерации"
                            value={stats.pendingCount}
                            icon={<Clock />}
                            color="yellow"
                        />
                        <StatCard
                            title="Одобрено мной"
                            value={stats.approvedByMe}
                            icon={<CheckCircle />}
                            color="green"
                        />
                        <StatCard
                            title="Отклонено мной"
                            value={stats.rejectedByMe}
                            icon={<XCircle />}
                            color="red"
                        />
                    </div>
                )}

                {/* Filters */}
                <ModerationFilters 
                    filters={filters}
                    onFilterChange={setFilters}
                />

                {/* Activities List */}
                <div className="space-y-4">
                    {activities.length === 0 ? (
                        <div className="bg-white rounded-2xl p-12 text-center">
                            <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
                            <h3 className="text-xl font-bold text-slate-900 mb-2">
                                Нет активностей на модерации
                            </h3>
                            <p className="text-slate-600">
                                Все активности проверены!
                            </p>
                        </div>
                    ) : (
                        activities.map(activity => (
                            <ModerationActivityCard
                                key={activity.id}
                                activity={activity}
                                onApprove={handleApprove}
                                onReject={handleReject}
                            />
                        ))
                    )}
                </div>
            </div>
        </div>
    );
};
```

### 2. Карточка активности на модерации

```tsx
interface ModerationActivityCardProps {
    activity: ActivityModeration;
    onApprove: (id: number) => void;
    onReject: (id: number, reason: string) => void;
}

export const ModerationActivityCard: React.FC<ModerationActivityCardProps> = ({
    activity,
    onApprove,
    onReject
}) => {
    const [showRejectModal, setShowRejectModal] = useState(false);
    const [rejectionReason, setRejectionReason] = useState('');

    const handleRejectSubmit = () => {
        if (rejectionReason.trim()) {
            onReject(activity.id, rejectionReason);
            setShowRejectModal(false);
            setRejectionReason('');
        }
    };

    return (
        <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
            <div className="grid md:grid-cols-2 gap-6 p-6">
                {/* Фото */}
                <div className="space-y-4">
                    {activity.photoUrls && activity.photoUrls.length > 0 ? (
                        <PhotoCarousel photos={activity.photoUrls} />
                    ) : (
                        <div className="h-64 bg-slate-100 rounded-xl flex items-center justify-center">
                            <ImageIcon className="w-16 h-16 text-slate-300" />
                        </div>
                    )}
                </div>

                {/* Информация */}
                <div className="flex flex-col justify-between">
                    <div>
                        <h3 className="text-2xl font-bold text-slate-900 mb-4">
                            {activity.type}
                        </h3>

                        <div className="space-y-3 mb-6">
                            <InfoRow icon={<User />} label="Участник">
                                {activity.participantName}
                            </InfoRow>
                            <InfoRow icon={<Users />} label="Команда">
                                {activity.teamName}
                            </InfoRow>
                            <InfoRow icon={<Calendar />} label="Мероприятие">
                                {activity.eventName}
                            </InfoRow>
                            <InfoRow icon={<Trophy />} label="Баллы">
                                <span className="text-2xl font-bold text-blue-600">
                                    {activity.energy}
                                </span>
                            </InfoRow>
                            <InfoRow icon={<Clock />} label="Создано">
                                {formatDate(activity.createdAt)}
                            </InfoRow>
                        </div>
                    </div>

                    {/* Действия */}
                    <div className="flex gap-3">
                        <button
                            onClick={() => setShowRejectModal(true)}
                            className="flex-1 py-3 px-6 bg-red-100 text-red-700 rounded-xl font-bold hover:bg-red-200 transition-all"
                        >
                            <XCircle className="w-5 h-5 inline mr-2" />
                            Отклонить
                        </button>
                        <button
                            onClick={() => onApprove(activity.id)}
                            className="flex-1 py-3 px-6 bg-green-600 text-white rounded-xl font-bold hover:bg-green-700 transition-all shadow-lg"
                        >
                            <CheckCircle className="w-5 h-5 inline mr-2" />
                            Одобрить
                        </button>
                    </div>
                </div>
            </div>

            {/* Модальное окно отклонения */}
            {showRejectModal && (
                <RejectModal
                    onClose={() => setShowRejectModal(false)}
                    onSubmit={handleRejectSubmit}
                    reason={rejectionReason}
                    setReason={setRejectionReason}
                />
            )}
        </div>
    );
};
```

### 3. Обновление Header для модераторов

```tsx
// Добавить пункт меню для модераторов
{user.role === 'MODERATOR' || user.role === 'ADMIN' ? (
    <Link to="/moderation" className="nav-link">
        <Shield className="w-5 h-5" />
        Модерация
        {pendingCount > 0 && (
            <span className="badge">{pendingCount}</span>
        )}
    </Link>
) : null}
```

### 4. Обновление роутинга

```tsx
// App.tsx
<Route path="/moderation" element={
    <ProtectedRoute roles={['MODERATOR', 'ADMIN']}>
        <ModerationPanel />
    </ProtectedRoute>
} />
```

---

## Порядок реализации

### Этап 1: Backend - Базовая инфраструктура (2-3 часа)
1. Создать enum `ActivityStatus`
2. Обновить enum `Role` (добавить `MODERATOR`)
3. Создать миграцию для добавления полей модерации в `activities`
4. Обновить модель `Activity`
5. Обновить `ActivityRepository` с новыми методами

### Этап 2: Backend - Логика модерации (3-4 часа)
1. Создать `ModerationService` с методами approve/reject/getPending
2. Создать DTO классы
3. Создать `ModerationController` с endpoints
4. Обновить `ActivityService` для учета статусов при создании
5. Обновить методы подсчета баллов (только APPROVED/AUTO_APPROVED)

### Этап 3: Frontend - Кабинет модератора (4-5 часов)
1. Создать `ModerationPanel` компонент
2. Создать `ModerationActivityCard` компонент
3. Создать `RejectModal` компонент
4. Создать `ModerationFilters` компонент
5. Добавить роутинг и защиту маршрута
6. Обновить Header с пунктом "Модерация"

### Этап 4: Уведомления и UX (2-3 часа)
1. Добавить уведомления при одобрении/отклонении
2. Добавить индикатор количества активностей на модерации
3. Добавить возможность просмотра отклоненных активностей для пользователя
4. Добавить фильтры и поиск в кабинете модератора

### Этап 5: Тестирование и доработка (2-3 часа)
1. Протестировать весь флоу модерации
2. Проверить права доступа
3. Проверить корректность подсчета баллов
4. Добавить валидацию и обработку ошибок

---

## Дополнительные улучшения

### Назначение модераторов
```java
// AdminController.java
@PostMapping("/participants/{id}/assign-moderator")
public ResponseEntity<Void> assignModerator(@PathVariable Long id) {
    Participant participant = participantRepository.findById(id)
            .orElseThrow(() -> new RuntimeException("Participant not found"));
    participant.setRole(Role.MODERATOR);
    participantRepository.save(participant);
    return ResponseEntity.ok().build();
}
```

### Статистика модерации
- Среднее время модерации
- Топ модераторов по количеству проверенных активностей
- График активностей по статусам

### Массовые операции
- Одобрить все активности команды
- Фильтрация по типу активности
- Экспорт списка на модерации

---

## Безопасность

1. **Проверка прав доступа:**
   - Использовать `@PreAuthorize` для защиты endpoints
   - Проверять роль в сервисах

2. **Валидация:**
   - Причина отклонения обязательна и не более 500 символов
   - Нельзя модерировать уже промодерированную активность

3. **Аудит:**
   - Логировать все действия модераторов
   - Сохранять историю изменений статусов

---

## Миграция существующих данных

```sql
-- Установить статус для всех существующих активностей
UPDATE activities 
SET status = 'AUTO_APPROVED' 
WHERE status IS NULL;
```

---

## Итого

**Общее время реализации:** 13-18 часов

**Ключевые компоненты:**
- 2 миграции БД
- 1 новый enum (ActivityStatus)
- 1 обновленный enum (Role)
- 1 новый сервис (ModerationService)
- 1 новый контроллер (ModerationController)
- 4-5 новых DTO
- 3-4 новых React компонента
- Обновления существующих сервисов и репозиториев
