# Backend Requirements - Sporttyx API

Полная документация по всем требованиям к backend API для приложения Sporttyx.

---

# Содержание
1. [Модели данных (Entities)](#модели-данных)
2. [API Endpoints](#api-endpoints)
3. [Система приглашений](#система-приглашений)

---

# Модели данных

## 1. Participant (Участник)

```sql
CREATE TABLE participants (
    id BIGSERIAL PRIMARY KEY,
    username VARCHAR(50) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(100),
    phone VARCHAR(20),
    profile_image_url TEXT,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);
```

**Entity (Java):**
```java
@Entity
@Table(name = "participants")
public class Participant {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @Column(unique = true, nullable = false, length = 50)
    private String username;
    
    @Column(nullable = false)
    private String password;
    
    @Column(nullable = false, length = 100)
    private String name;
    
    private String email;
    private String phone;
    
    @Column(name = "profile_image_url")
    private String profileImageUrl;
    
    @Column(name = "created_at", nullable = false)
    private LocalDateTime createdAt = LocalDateTime.now();
    
    // getters, setters
}
```

---

## 2. Team (Команда)

```sql
CREATE TABLE teams (
    id BIGSERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    motto VARCHAR(255),
    image_url TEXT,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);
```

**Entity (Java):**
```java
@Entity
@Table(name = "teams")
public class Team {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @Column(nullable = false, length = 100)
    private String name;
    
    private String motto;
    
    @Column(name = "image_url")
    private String imageUrl;
    
    @Column(name = "created_at", nullable = false)
    private LocalDateTime createdAt = LocalDateTime.now();
    
    // getters, setters
}
```

---

## 3. TeamParticipant (Связь команда-участник)

```sql
CREATE TABLE team_participants (
    id BIGSERIAL PRIMARY KEY,
    team_id BIGINT NOT NULL,
    participant_id BIGINT NOT NULL,
    role VARCHAR(20) NOT NULL DEFAULT 'PARTICIPANT',  -- CAPTAIN, PARTICIPANT
    joined_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (team_id) REFERENCES teams(id) ON DELETE CASCADE,
    FOREIGN KEY (participant_id) REFERENCES participants(id) ON DELETE CASCADE,
    
    UNIQUE(team_id, participant_id)
);

CREATE INDEX idx_team_participants_team ON team_participants(team_id);
CREATE INDEX idx_team_participants_participant ON team_participants(participant_id);
```

**Entity (Java):**
```java
@Entity
@Table(name = "team_participants")
public class TeamParticipant {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @ManyToOne
    @JoinColumn(name = "team_id", nullable = false)
    private Team team;
    
    @ManyToOne
    @JoinColumn(name = "participant_id", nullable = false)
    private Participant participant;
    
    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private TeamRole role = TeamRole.PARTICIPANT;
    
    @Column(name = "joined_at", nullable = false)
    private LocalDateTime joinedAt = LocalDateTime.now();
    
    // getters, setters
}

public enum TeamRole {
    CAPTAIN,
    PARTICIPANT
}
```

---

## 4. Activity (Активность)

```sql
CREATE TABLE activities (
    id BIGSERIAL PRIMARY KEY,
    team_id BIGINT NOT NULL,
    participant_id BIGINT NOT NULL,
    type VARCHAR(100) NOT NULL,
    energy INTEGER NOT NULL,
    photo_url TEXT,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (team_id) REFERENCES teams(id) ON DELETE CASCADE,
    FOREIGN KEY (participant_id) REFERENCES participants(id) ON DELETE CASCADE
);

CREATE INDEX idx_activities_team ON activities(team_id);
CREATE INDEX idx_activities_participant ON activities(participant_id);
CREATE INDEX idx_activities_created ON activities(created_at DESC);
```

**Entity (Java):**
```java
@Entity
@Table(name = "activities")
public class Activity {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @ManyToOne
    @JoinColumn(name = "team_id", nullable = false)
    private Team team;
    
    @ManyToOne
    @JoinColumn(name = "participant_id", nullable = false)
    private Participant participant;
    
    @Column(nullable = false, length = 100)
    private String type;
    
    @Column(nullable = false)
    private Integer energy;
    
    @Column(name = "photo_url")
    private String photoUrl;
    
    @Column(name = "created_at", nullable = false)
    private LocalDateTime createdAt = LocalDateTime.now();
    
    // getters, setters
}
```

---

# API Endpoints

## Authentication

### Регистрация
```
POST /api/auth/register
Content-Type: application/json

Request:
{
    "username": "ivan",
    "password": "password123",
    "name": "Иван Иванов"
}

Response 201:
{
    "token": "jwt_token_here",
    "userId": 1,
    "username": "ivan",
    "name": "Иван Иванов"
}
```

### Вход
```
POST /api/auth/login
Content-Type: application/json

Request:
{
    "username": "ivan",
    "password": "password123"
}

Response 200:
{
    "token": "jwt_token_here",
    "userId": 1,
    "username": "ivan",
    "name": "Иван Иванов"
}
```

---

## Participants (Участники)

### Получить профиль участника
```
GET /api/participants/{id}
Authorization: Bearer {token}

Response 200:
{
    "id": 1,
    "username": "ivan",
    "name": "Иван Иванов",
    "email": "ivan@example.com",
    "phone": "+7 (999) 123-45-67",
    "profileImageUrl": "https://...",
    "teamName": "Команда Чемпионов"
}
```

### Обновить профиль
```
PUT /api/participants/{id}
Authorization: Bearer {token}
Content-Type: application/json

Request:
{
    "name": "Иван Петрович Иванов",
    "email": "ivan.new@example.com",
    "phone": "+7 (999) 999-99-99",
    "profileImageUrl": "https://..."
}

Response 200:
{
    "id": 1,
    "name": "Иван Петрович Иванов",
    ...
}
```

### Удалить профиль
```
DELETE /api/participants/{id}
Authorization: Bearer {token}

Response 204 No Content
```

### Поиск участников
```
GET /api/participants/search?query={searchTerm}
Authorization: Bearer {token}

Response 200:
[
    {
        "id": 2,
        "name": "Мария Петрова"
    },
    {
        "id": 3,
        "name": "Алексей Сидоров"
    }
]
```

---

## Teams (Команды)

### Получить список команд
```
GET /api/teams
Authorization: Bearer {token}

Response 200:
[
    {
        "id": 1,
        "name": "Команда Чемпионов"
    },
    {
        "id": 2,
        "name": "Спортивные Львы"
    }
]
```

### Получить команду по ID
```
GET /api/teams/{id}
Authorization: Bearer {token}

Response 200:
{
    "id": 1,
    "name": "Команда Чемпионов",
    "motto": "Вместе к победе! 🏆",
    "imageUrl": "https://...",
    "totalPoints": 1250,
    "rank": 1,
    "participants": [
        {
            "id": 1,
            "name": "Иван Иванов",
            "role": "CAPTAIN"
        },
        {
            "id": 2,
            "name": "Мария Петрова",
            "role": "PARTICIPANT"
        }
    ]
}
```

### Создать команду
```
POST /api/teams
Authorization: Bearer {token}
Content-Type: application/json

Request:
{
    "name": "Новая Команда",
    "motto": "Наш девиз!",
    "participantIds": [1, 2, 3]
}

Response 201:
{
    "id": 5,
    "name": "Новая Команда",
    "motto": "Наш девиз!",
    "createdAt": "2024-02-11T10:00:00"
}
```

### Обновить команду
```
PUT /api/teams/{id}
Authorization: Bearer {token}
Content-Type: application/json

Request:
{
    "name": "Обновленное название",
    "motto": "Новый девиз",
    "imageUrl": "https://...",
    "participants": [
        {"id": 1, "role": "CAPTAIN"},
        {"id": 2, "role": "PARTICIPANT"}
    ]
}

Response 200:
{
    "id": 1,
    "name": "Обновленное название",
    ...
}
```

### Удалить команду
```
DELETE /api/teams/{id}
Authorization: Bearer {token}

Response 204 No Content
```

### Покинуть команду
```
POST /api/teams/{teamId}/leave
Authorization: Bearer {token}

Response 200:
{
    "message": "You have left the team"
}
```

### Получить участников команды
```
GET /api/teams/{id}/participants
Authorization: Bearer {token}

Response 200:
[
    {
        "id": 1,
        "name": "Иван Иванов",
        "role": "CAPTAIN"
    },
    {
        "id": 2,
        "name": "Мария Петрова",
        "role": "PARTICIPANT"
    }
]
```

### Рейтинг команд
```
GET /api/teams/rankings
Authorization: Bearer {token}

Response 200:
[
    {
        "id": 1,
        "name": "Команда Чемпионов",
        "totalPoints": 2450,
        "participantCount": 5,
        "rank": 1
    },
    {
        "id": 2,
        "name": "Спортивные Львы",
        "totalPoints": 2180,
        "participantCount": 6,
        "rank": 2
    }
]
```

---

## Activities (Активности)

### Получить активности команды
```
GET /api/teams/{teamId}/activities
Authorization: Bearer {token}

Response 200:
[
    {
        "id": 1,
        "type": "Бег",
        "energy": 150,
        "participantName": "Иван Иванов",
        "photoUrl": "https://...",
        "createdAt": "2024-02-10T10:30:00"
    }
]
```

### Создать активность
```
POST /api/activities
Authorization: Bearer {token}
Content-Type: multipart/form-data

Request (FormData):
- teamId: 1
- participantId: 1
- type: "Бег"
- energy: 150
- photo: [file]

Response 201:
{
    "id": 10,
    "type": "Бег",
    "energy": 150,
    "createdAt": "2024-02-11T10:00:00"
}
```

---

# Backend Requirements для системы приглашений

## Таблица: team_invitations

Для реализации функционала приглашений в команду необходимо создать таблицу `team_invitations` в базе данных.

### Структура таблицы:

```sql
CREATE TABLE team_invitations (
    id BIGSERIAL PRIMARY KEY,
    team_id BIGINT NOT NULL,
    participant_id BIGINT NOT NULL,  -- кого приглашают
    invited_by_id BIGINT NOT NULL,   -- кто пригласил
    status VARCHAR(20) NOT NULL DEFAULT 'PENDING',  -- PENDING, ACCEPTED, DECLINED
    invited_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    responded_at TIMESTAMP,
    
    FOREIGN KEY (team_id) REFERENCES teams(id) ON DELETE CASCADE,
    FOREIGN KEY (participant_id) REFERENCES participants(id) ON DELETE CASCADE,
    FOREIGN KEY (invited_by_id) REFERENCES participants(id) ON DELETE CASCADE,
    
    UNIQUE(team_id, participant_id, status)  -- один активный инвайт на команду
);

CREATE INDEX idx_invitations_participant ON team_invitations(participant_id, status);
CREATE INDEX idx_invitations_team ON team_invitations(team_id, status);
```

## API Endpoints

### 1. Получить приглашения участника
```
GET /api/participants/{participantId}/invitations
Authorization: Bearer {token}

Response 200:
[
    {
        "id": 1,
        "teamId": 2,
        "teamName": "Спортивные Львы",
        "invitedBy": "Мария Петрова",
        "invitedAt": "2024-02-10T10:30:00"
    }
]
```

### 2. Создать приглашение (при добавлении в команду)
```
POST /api/teams/{teamId}/invite
Authorization: Bearer {token}
Content-Type: application/json

Request:
{
    "participantId": 5
}

Response 201:
{
    "id": 1,
    "teamId": 2,
    "participantId": 5,
    "status": "PENDING",
    "invitedAt": "2024-02-10T10:30:00"
}
```

### 3. Принять приглашение
```
POST /api/invitations/{invitationId}/accept
Authorization: Bearer {token}

Response 200:
{
    "message": "Invitation accepted",
    "teamId": 2
}

Действия:
- Обновить status = 'ACCEPTED', responded_at = NOW()
- Добавить участника в команду (team_participants)
```

### 4. Отклонить приглашение
```
POST /api/invitations/{invitationId}/decline
Authorization: Bearer {token}

Response 200:
{
    "message": "Invitation declined"
}

Действия:
- Обновить status = 'DECLINED', responded_at = NOW()
```

## Entity класс (Java)

```java
@Entity
@Table(name = "team_invitations")
public class TeamInvitation {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @ManyToOne
    @JoinColumn(name = "team_id", nullable = false)
    private Team team;
    
    @ManyToOne
    @JoinColumn(name = "participant_id", nullable = false)
    private Participant participant;
    
    @ManyToOne
    @JoinColumn(name = "invited_by_id", nullable = false)
    private Participant invitedBy;
    
    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private InvitationStatus status = InvitationStatus.PENDING;
    
    @Column(name = "invited_at", nullable = false)
    private LocalDateTime invitedAt = LocalDateTime.now();
    
    @Column(name = "responded_at")
    private LocalDateTime respondedAt;
    
    // getters, setters
}

public enum InvitationStatus {
    PENDING,
    ACCEPTED,
    DECLINED
}
```

## Repository

```java
public interface TeamInvitationRepository extends JpaRepository<TeamInvitation, Long> {
    List<TeamInvitation> findByParticipantIdAndStatus(Long participantId, InvitationStatus status);
    List<TeamInvitation> findByTeamIdAndStatus(Long teamId, InvitationStatus status);
    Optional<TeamInvitation> findByTeamIdAndParticipantIdAndStatus(Long teamId, Long participantId, InvitationStatus status);
}
```

## Бизнес-логика

### При создании приглашения:
1. Проверить, что приглашающий является капитаном/участником команды
2. Проверить, что приглашаемый еще не в команде
3. Проверить, что нет активного (PENDING) приглашения для этого участника в эту команду
4. Создать запись в team_invitations со статусом PENDING

### При принятии приглашения:
1. Проверить, что приглашение принадлежит текущему пользователю
2. Проверить, что статус = PENDING
3. Добавить участника в команду
4. Обновить статус приглашения на ACCEPTED
5. Установить responded_at

### При отклонении приглашения:
1. Проверить, что приглашение принадлежит текущему пользователю
2. Проверить, что статус = PENDING
3. Обновить статус на DECLINED
4. Установить responded_at

## Уведомления (опционально)

Можно добавить:
- Email уведомления при новом приглашении
- Push уведомления в браузере
- Счетчик непрочитанных приглашений в header
