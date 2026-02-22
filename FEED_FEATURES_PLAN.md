# План доработки дашборда "Лента"

## Текущее состояние (Реализовано ✅)

1. **Множественные фото для активностей**
   - ✅ Таблица `activity_photos` создана
   - ✅ Backend поддерживает загрузку нескольких фото
   - ✅ Frontend отображает первое фото + индикатор количества
   - ✅ Детальный просмотр с каруселью фото
   - ✅ Ограничение: 10 фото на активность

## Планируемые доработки

### 1. Система реакций (вместо простых лайков)

**Backend:**

#### База данных
```sql
CREATE TABLE activity_reactions (
    id BIGSERIAL PRIMARY KEY,
    activity_id BIGINT NOT NULL REFERENCES activities(id) ON DELETE CASCADE,
    participant_id BIGINT NOT NULL REFERENCES participants(id) ON DELETE CASCADE,
    reaction_type VARCHAR(20) NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(activity_id, participant_id)
);

CREATE INDEX idx_activity_reactions_activity_id ON activity_reactions(activity_id);
CREATE INDEX idx_activity_reactions_participant_id ON activity_reactions(participant_id);
```

#### Типы реакций
- `LIKE` - ❤️ Нравится
- `FIRE` - 🔥 Огонь
- `STRONG` - 💪 Сила
- `CLAP` - 👏 Браво
- `LOVE` - 😍 Восторг

#### Java модели
```java
// ActivityReaction.java
@Entity
@Table(name = "activity_reactions")
public class ActivityReaction {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @ManyToOne
    @JoinColumn(name = "activity_id", nullable = false)
    private Activity activity;
    
    @ManyToOne
    @JoinColumn(name = "participant_id", nullable = false)
    private Participant participant;
    
    @Enumerated(EnumType.STRING)
    @Column(name = "reaction_type", nullable = false)
    private ReactionType reactionType;
    
    @Column(name = "created_at", nullable = false)
    private LocalDateTime createdAt = LocalDateTime.now();
}

// ReactionType.java
public enum ReactionType {
    LIKE,    // ❤️
    FIRE,    // 🔥
    STRONG,  // 💪
    CLAP,    // 👏
    LOVE     // 😍
}
```

#### API Endpoints
```java
// ActivityReactionController.java

// Добавить/изменить реакцию
POST /api/activities/{id}/reactions
Body: { "reactionType": "LIKE" }
Response: { "success": true }

// Удалить свою реакцию
DELETE /api/activities/{id}/reactions
Response: { "success": true }

// Получить реакции активности
GET /api/activities/{id}/reactions
Response: {
    "reactionCounts": {
        "LIKE": 15,
        "FIRE": 8,
        "STRONG": 12,
        "CLAP": 5,
        "LOVE": 3
    },
    "userReaction": "LIKE"  // или null
}
```

#### Service методы
```java
// ActivityReactionService.java
- addOrUpdateReaction(activityId, participantId, reactionType)
- removeReaction(activityId, participantId)
- getActivityReactions(activityId, currentUserId)
- getReactionCounts(activityId)
```

**Frontend:**

#### Компоненты
```tsx
// ReactionButton.tsx
interface ReactionButtonProps {
    activityId: number;
    reactionType: ReactionType;
    count: number;
    isActive: boolean;
    onReact: (type: ReactionType) => void;
}

// Панель реакций под постом
<div className="flex gap-2">
    <ReactionButton type="LIKE" emoji="❤️" count={15} />
    <ReactionButton type="FIRE" emoji="🔥" count={8} />
    <ReactionButton type="STRONG" emoji="💪" count={12} />
    <ReactionButton type="CLAP" emoji="👏" count={5} />
    <ReactionButton type="LOVE" emoji="😍" count={3} />
</div>
```

#### Обновление ActivityResponse DTO
```java
public class ActivityResponse {
    // ... существующие поля
    private Map<String, Integer> reactionCounts;
    private String userReaction;  // LIKE, FIRE, etc. или null
    private Integer totalReactions;
}
```

---

### 2. Система комментариев с реакциями

**Backend:**

#### База данных
```sql
CREATE TABLE activity_comments (
    id BIGSERIAL PRIMARY KEY,
    activity_id BIGINT NOT NULL REFERENCES activities(id) ON DELETE CASCADE,
    participant_id BIGINT NOT NULL REFERENCES participants(id) ON DELETE CASCADE,
    text TEXT NOT NULL,
    mentioned_participant_id BIGINT REFERENCES participants(id) ON DELETE SET NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE comment_reactions (
    id BIGSERIAL PRIMARY KEY,
    comment_id BIGINT NOT NULL REFERENCES activity_comments(id) ON DELETE CASCADE,
    participant_id BIGINT NOT NULL REFERENCES participants(id) ON DELETE CASCADE,
    reaction_type VARCHAR(20) NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(comment_id, participant_id)
);

CREATE INDEX idx_activity_comments_activity_id ON activity_comments(activity_id);
CREATE INDEX idx_comment_reactions_comment_id ON comment_reactions(comment_id);
```

#### Java модели
```java
// ActivityComment.java
@Entity
@Table(name = "activity_comments")
public class ActivityComment {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @ManyToOne
    @JoinColumn(name = "activity_id", nullable = false)
    private Activity activity;
    
    @ManyToOne
    @JoinColumn(name = "participant_id", nullable = false)
    private Participant participant;
    
    @Column(nullable = false, columnDefinition = "TEXT")
    private String text;
    
    @ManyToOne
    @JoinColumn(name = "mentioned_participant_id")
    private Participant mentionedParticipant;
    
    @OneToMany(mappedBy = "comment", cascade = CascadeType.ALL)
    private List<CommentReaction> reactions = new ArrayList<>();
    
    @Column(name = "created_at", nullable = false)
    private LocalDateTime createdAt = LocalDateTime.now();
    
    @Column(name = "updated_at", nullable = false)
    private LocalDateTime updatedAt = LocalDateTime.now();
}

// CommentReaction.java
@Entity
@Table(name = "comment_reactions")
public class CommentReaction {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @ManyToOne
    @JoinColumn(name = "comment_id", nullable = false)
    private ActivityComment comment;
    
    @ManyToOne
    @JoinColumn(name = "participant_id", nullable = false)
    private Participant participant;
    
    @Enumerated(EnumType.STRING)
    @Column(name = "reaction_type", nullable = false)
    private ReactionType reactionType;
    
    @Column(name = "created_at", nullable = false)
    private LocalDateTime createdAt = LocalDateTime.now();
}
```

#### API Endpoints
```java
// ActivityCommentController.java

// Добавить комментарий
POST /api/activities/{id}/comments
Body: { 
    "text": "Отличная пробежка! @username",
    "mentionedParticipantId": 123  // опционально
}
Response: CommentResponse

// Обновить комментарий
PUT /api/comments/{id}
Body: { "text": "Обновленный текст" }
Response: CommentResponse

// Удалить комментарий
DELETE /api/comments/{id}
Response: { "success": true }

// Получить комментарии активности
GET /api/activities/{id}/comments
Response: List<CommentResponse>

// Добавить реакцию на комментарий
POST /api/comments/{id}/reactions
Body: { "reactionType": "LIKE" }
Response: { "success": true }

// Удалить реакцию с комментария
DELETE /api/comments/{id}/reactions
Response: { "success": true }
```

#### DTO
```java
public class CommentResponse {
    private Long id;
    private Long activityId;
    private Long participantId;
    private String participantName;
    private String text;
    private Long mentionedParticipantId;
    private String mentionedParticipantName;
    private Map<String, Integer> reactionCounts;
    private String userReaction;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    private Boolean canEdit;  // true если текущий пользователь - автор
    private Boolean canDelete;
}
```

**Frontend:**

#### Компоненты
```tsx
// CommentSection.tsx
interface CommentSectionProps {
    activityId: number;
}

// CommentItem.tsx
interface CommentItemProps {
    comment: Comment;
    onEdit: (id: number, text: string) => void;
    onDelete: (id: number) => void;
    onReact: (id: number, type: ReactionType) => void;
}

// CommentInput.tsx
interface CommentInputProps {
    activityId: number;
    onSubmit: (text: string, mentionedUserId?: number) => void;
    placeholder?: string;
}
```

#### Функционал упоминаний
```tsx
// Автокомплит при вводе @
const handleTextChange = (text: string) => {
    const mentionMatch = text.match(/@(\w*)$/);
    if (mentionMatch) {
        // Показать список участников для выбора
        showMentionSuggestions(mentionMatch[1]);
    }
};
```

---

### 3. Обновление ленты для отображения реакций и комментариев

**Обновление ActivityResponse:**
```java
public class ActivityResponse {
    private Long id;
    private String type;
    private Integer energy;
    private String participantName;
    private String photoUrl;
    private List<String> photoUrls;
    private LocalDateTime createdAt;
    
    // Новые поля
    private Map<String, Integer> reactionCounts;
    private String userReaction;
    private Integer totalReactions;
    private Integer commentCount;
}
```

**Обновление ActivityFeed.tsx:**
```tsx
// Показывать счетчики под постом
<div className="flex items-center gap-4 text-sm text-slate-600">
    {/* Реакции */}
    <div className="flex items-center gap-1">
        {Object.entries(activity.reactionCounts).map(([type, count]) => (
            <span key={type}>{getReactionEmoji(type)} {count}</span>
        ))}
    </div>
    
    {/* Комментарии */}
    <div className="flex items-center gap-1">
        <MessageCircle className="w-4 h-4" />
        <span>{activity.commentCount} комментариев</span>
    </div>
</div>
```

---

## Порядок реализации

### Этап 1: Система реакций на активности (2-3 часа)
1. Создать миграцию БД для `activity_reactions`
2. Создать Java модели `ActivityReaction`, `ReactionType`
3. Создать `ActivityReactionRepository`
4. Создать `ActivityReactionService` с методами add/remove/get
5. Создать `ActivityReactionController` с endpoints
6. Обновить `ActivityResponse` для включения реакций
7. Обновить `ActivityService.getAllActivities()` для загрузки реакций
8. Создать frontend компонент `ReactionButton`
9. Интегрировать реакции в `ActivityFeed` и `ActivityView`

### Этап 2: Система комментариев (3-4 часа)
1. Создать миграции БД для `activity_comments`
2. Создать Java модель `ActivityComment`
3. Создать `ActivityCommentRepository`
4. Создать `ActivityCommentService` с CRUD методами
5. Создать `ActivityCommentController` с endpoints
6. Создать DTO `CommentResponse`, `CreateCommentRequest`
7. Создать frontend компонент `CommentSection`
8. Создать компонент `CommentItem` с редактированием/удалением
9. Создать компонент `CommentInput` с упоминаниями
10. Интегрировать в `ActivityView`

### Этап 3: Реакции на комментарии (1-2 часа)
1. Создать миграцию БД для `comment_reactions`
2. Создать Java модель `CommentReaction`
3. Создать `CommentReactionRepository`
4. Создать `CommentReactionService`
5. Добавить endpoints в `ActivityCommentController`
6. Обновить `CommentResponse` для включения реакций
7. Добавить панель реакций в `CommentItem`

### Этап 4: Уведомления (опционально, 2-3 часа)
1. Создать таблицу `notifications`
2. Создать сервис для генерации уведомлений при:
   - Реакции на активность
   - Комментарии к активности
   - Упоминании в комментарии
   - Реакции на комментарий
3. Создать endpoint для получения уведомлений
4. Добавить индикатор непрочитанных уведомлений в Header

---

## Технические детали

### Ограничения
- **Фото**: максимум 10 фото на активность ✅
- **Комментарии**: без вложенности (только упоминания)
- **Реакции**: одна реакция на пользователя (можно менять тип)
- **Текст комментария**: максимум 1000 символов

### Оптимизация
- Использовать JOIN FETCH для загрузки реакций вместе с активностями
- Кешировать счетчики реакций
- Пагинация комментариев (загружать по 20 за раз)
- Lazy loading для старых комментариев

### Безопасность
- Проверка прав на редактирование/удаление комментариев
- Валидация длины текста комментария
- Защита от спама (rate limiting)
- Санитизация HTML в комментариях

---

## Вопросы и ответы

1. **Какие типы реакций?**
   - ❤️ Нравится (LIKE)
   - 🔥 Огонь (FIRE)
   - 💪 Сила (STRONG)
   - 👏 Браво (CLAP)
   - 😍 Восторг (LOVE)

2. **Нужна ли возможность отвечать на комментарии (вложенные комментарии)?**
   - Нет, вместо этого используем упоминания (@username)

3. **Должны ли быть уведомления при реакциях/комментариях?**
   - Да, реализовать систему уведомлений

4. **Ограничение на количество фото на одну активность?**
   - Да, максимум 10 фото

---

## Примечания для реализации

- Все изменения должны быть обратно совместимы
- Использовать транзакции для операций с реакциями
- Добавить индексы для оптимизации запросов
- Покрыть тестами критичные методы
- Обновить API документацию
- Добавить миграции в правильном порядке
