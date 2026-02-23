# API Documentation - Sporttyx

Документация API для приложения Sporttyx. Включает описание всех эндпоинтов, параметров запросов и ответов.

## Базовый URL
```
http://localhost:8080/api
```

## Аутентификация

Большинство эндпоинтов требуют JWT токен в заголовке:
```
Authorization: Bearer <token>
```

---

## 1. Аутентификация (Auth)

### 1.1 Регистрация
**POST** `/api/auth/register`

Регистрация нового пользователя в системе.

**Request Body:**
```json
{
  "username": "string",
  "password": "string",
  "name": "string",
  "email": "string",
  "phone": "string"
}
```

**Response:** `201 Created`
```json
{
  "token": "string",
  "userId": "number",
  "username": "string",
  "role": "string"
}
```

### 1.2 Вход
**POST** `/api/auth/login`

Аутентификация пользователя.

**Request Body:**
```json
{
  "username": "string",
  "password": "string"
}
```

**Response:** `200 OK`
```json
{
  "token": "string",
  "userId": "number",
  "username": "string",
  "role": "string"
}
```

---

## 2. Активности (Activities)

### 2.1 Получить все активности
**GET** `/api/activities/all`

Получить список всех активностей с пагинацией.

**Query Parameters:**
- `page` (optional, default: 0) - номер страницы
- `size` (optional, default: 10) - размер страницы

**Headers:**
- `Authorization: Bearer <token>`

**Response:** `200 OK`
```json
[
  {
    "id": "number",
    "teamId": "number",
    "teamName": "string",
    "type": "string",
    "energy": "number",
    "description": "string",
    "durationMinutes": "number",
    "createdAt": "string (ISO 8601)",
    "participants": [
      {
        "id": "number",
        "name": "string",
        "profileImageUrl": "string"
      }
    ],
    "photos": ["string"],
    "reactions": {
      "LIKE": "number",
      "LOVE": "number",
      "FIRE": "number"
    },
    "userReaction": "string or null",
    "commentsCount": "number",
    "status": "string"
  }
]
```

### 2.2 Получить активность по ID
**GET** `/api/activities/{id}`

Получить детальную информацию об активности.

**Path Parameters:**
- `id` - идентификатор активности

**Headers:**
- `Authorization: Bearer <token>`

**Response:** `200 OK`
```json
{
  "id": "number",
  "teamId": "number",
  "teamName": "string",
  "type": "string",
  "energy": "number",
  "description": "string",
  "durationMinutes": "number",
  "createdAt": "string (ISO 8601)",
  "participants": [...],
  "photos": [...],
  "reactions": {...},
  "userReaction": "string or null",
  "commentsCount": "number",
  "status": "string"
}
```

### 2.3 Получить активности команды
**GET** `/api/teams/{teamId}/activities`

Получить все активности конкретной команды.

**Path Parameters:**
- `teamId` - идентификатор команды

**Headers:**
- `Authorization: Bearer <token>`

**Response:** `200 OK` - массив активностей

### 2.4 Создать активность
**POST** `/api/activities`

Создать новую активность для команды.

**Headers:**
- `Authorization: Bearer <token>`
- `Content-Type: multipart/form-data`

**Form Data:**
- `teamId` (required) - ID команды
- `participantId` (required) - ID создателя
- `type` (required) - тип активности
- `energy` (required) - количество энергии/баллов
- `description` (optional) - описание
- `durationMinutes` (optional) - длительность в минутах
- `photos` (optional) - массив файлов изображений
- `participantIds` (optional) - массив ID дополнительных участников

**Response:** `201 Created`
```json
{
  "id": "number",
  "message": "string",
  "status": "string"
}
```

### 2.5 Покинуть активность
**POST** `/api/activities/{id}/leave`

Удалить себя из списка участников активности.

**Path Parameters:**
- `id` - идентификатор активности

**Headers:**
- `Authorization: Bearer <token>`

**Response:** `200 OK`

---

## 3. Команды (Teams)

### 3.1 Получить все команды
**GET** `/api/teams`

Получить список всех команд.

**Query Parameters:**
- `eventId` (optional) - фильтр по событию

**Response:** `200 OK`
```json
[
  {
    "id": "number",
    "name": "string"
  }
]
```

### 3.2 Получить команду по ID
**GET** `/api/teams/{id}`

Получить детальную информацию о команде.

**Path Parameters:**
- `id` - идентификатор команды

**Response:** `200 OK`
```json
{
  "id": "number",
  "name": "string",
  "motto": "string",
  "imageUrl": "string",
  "eventId": "number",
  "eventName": "string",
  "totalEnergy": "number",
  "participantCount": "number",
  "createdAt": "string (ISO 8601)"
}
```

### 3.3 Создать команду
**POST** `/api/teams`

Создать новую команду.

**Headers:**
- `Authorization: Bearer <token>`

**Request Body:**
```json
{
  "name": "string",
  "motto": "string",
  "eventId": "number"
}
```

**Response:** `201 Created`
```json
{
  "id": "number",
  "name": "string",
  "motto": "string",
  "imageUrl": "string",
  "event": {...}
}
```

### 3.4 Обновить команду
**PUT** `/api/teams/{id}`

Обновить информацию о команде.

**Path Parameters:**
- `id` - идентификатор команды

**Headers:**
- `Authorization: Bearer <token>`

**Request Body:**
```json
{
  "name": "string",
  "motto": "string"
}
```

**Response:** `200 OK`

### 3.5 Удалить команду
**DELETE** `/api/teams/{id}`

Удалить команду.

**Path Parameters:**
- `id` - идентификатор команды

**Headers:**
- `Authorization: Bearer <token>`

**Response:** `204 No Content`

### 3.6 Покинуть команду
**POST** `/api/teams/{teamId}/leave`

Покинуть команду.

**Path Parameters:**
- `teamId` - идентификатор команды

**Headers:**
- `Authorization: Bearer <token>`

**Response:** `200 OK`
```json
{
  "message": "You have left the team"
}
```

### 3.7 Получить участников команды
**GET** `/api/teams/{id}/participants`

Получить список участников команды.

**Path Parameters:**
- `id` - идентификатор команды

**Response:** `200 OK`
```json
[
  {
    "id": "number",
    "name": "string",
    "username": "string",
    "profileImageUrl": "string",
    "role": "string",
    "totalEnergy": "number"
  }
]
```

### 3.8 Получить рейтинг команд
**GET** `/api/teams/rankings`

Получить рейтинг всех команд.

**Response:** `200 OK`
```json
[
  {
    "teamId": "number",
    "teamName": "string",
    "totalEnergy": "number",
    "participantCount": "number",
    "rank": "number"
  }
]
```

### 3.9 Получить статистику регулярности
**GET** `/api/teams/regularity-stats`

Получить статистику регулярности активностей команд.

**Response:** `200 OK`
```json
[
  {
    "teamId": "number",
    "teamName": "string",
    "regularityScore": "number",
    "activeDays": "number",
    "totalDays": "number"
  }
]
```

### 3.10 Получить тепловую карту активностей
**GET** `/api/teams/{id}/activity-heatmap`

Получить тепловую карту активностей команды.

**Path Parameters:**
- `id` - идентификатор команды

**Response:** `200 OK`
```json
[
  {
    "date": "string (YYYY-MM-DD)",
    "count": "number",
    "totalEnergy": "number"
  }
]
```

### 3.11 Загрузить изображение команды
**POST** `/api/teams/{id}/upload-image`

Загрузить изображение для команды.

**Path Parameters:**
- `id` - идентификатор команды

**Headers:**
- `Content-Type: multipart/form-data`

**Form Data:**
- `image` (required) - файл изображения

**Response:** `200 OK`
```json
{
  "imageUrl": "string"
}
```

---

## 4. События (Events)

### 4.1 Получить все события
**GET** `/api/events`

Получить список всех событий.

**Response:** `200 OK`
```json
[
  {
    "id": "number",
    "name": "string"
  }
]
```

### 4.2 Получить событие по ID
**GET** `/api/events/{id}`

Получить детальную информацию о событии.

**Path Parameters:**
- `id` - идентификатор события

**Response:** `200 OK`
```json
{
  "id": "number",
  "name": "string",
  "description": "string",
  "startDate": "string (ISO 8601)",
  "endDate": "string (ISO 8601)",
  "isActive": "boolean",
  "displayOnHomepage": "boolean",
  "requiresModeration": "boolean"
}
```

### 4.3 Получить активные события
**GET** `/api/events/active`

Получить список активных событий.

**Response:** `200 OK` - массив событий

### 4.4 Получить отображаемое событие
**GET** `/api/events/displayed`

Получить событие для отображения на главной странице.

**Response:** `200 OK` или `204 No Content`

---

## 5. Участники (Participants)

### 5.1 Получить участника по ID
**GET** `/api/participants/{id}`

Получить информацию об участнике.

**Path Parameters:**
- `id` - идентификатор участника

**Response:** `200 OK`
```json
{
  "id": "number",
  "username": "string",
  "name": "string",
  "email": "string",
  "phone": "string",
  "profileImageUrl": "string",
  "role": "string",
  "teamId": "number",
  "teamName": "string",
  "totalEnergy": "number"
}
```

### 5.2 Обновить участника
**PUT** `/api/participants/{id}`

Обновить профиль участника.

**Path Parameters:**
- `id` - идентификатор участника

**Headers:**
- `Authorization: Bearer <token>`

**Request Body:**
```json
{
  "name": "string",
  "email": "string",
  "phone": "string",
  "profileImageUrl": "string"
}
```

**Response:** `200 OK`

### 5.3 Удалить участника
**DELETE** `/api/participants/{id}`

Удалить участника.

**Path Parameters:**
- `id` - идентификатор участника

**Headers:**
- `Authorization: Bearer <token>`

**Response:** `204 No Content`

### 5.4 Поиск участников
**GET** `/api/participants/search`

Поиск участников по имени или username.

**Query Parameters:**
- `query` (required) - поисковый запрос

**Response:** `200 OK`
```json
[
  {
    "id": "number",
    "username": "string",
    "name": "string",
    "profileImageUrl": "string"
  }
]
```

### 5.5 Изменить пароль
**POST** `/api/participants/{id}/change-password`

Изменить пароль участника.

**Path Parameters:**
- `id` - идентификатор участника

**Headers:**
- `Authorization: Bearer <token>`

**Request Body:**
```json
{
  "oldPassword": "string",
  "newPassword": "string"
}
```

**Response:** `200 OK`

### 5.6 Получить рейтинг участников
**GET** `/api/participants/rankings`

Получить рейтинг участников для события.

**Query Parameters:**
- `eventId` (required) - идентификатор события

**Response:** `200 OK`
```json
[
  {
    "participantId": "number",
    "name": "string",
    "teamName": "string",
    "totalEnergy": "number",
    "rank": "number"
  }
]
```

### 5.7 Получить события участника
**GET** `/api/participants/{id}/events`

Получить все события, в которых участвует пользователь.

**Path Parameters:**
- `id` - идентификатор участника

**Response:** `200 OK` - массив событий

---

## 6. Комментарии (Comments)

### 6.1 Получить комментарии активности
**GET** `/api/activities/{id}/comments`

Получить все комментарии к активности.

**Path Parameters:**
- `id` - идентификатор активности

**Headers:**
- `Authorization: Bearer <token>` (optional)

**Response:** `200 OK`
```json
[
  {
    "id": "number",
    "text": "string",
    "createdAt": "string (ISO 8601)",
    "author": {
      "id": "number",
      "name": "string",
      "profileImageUrl": "string"
    },
    "reactions": {
      "LIKE": "number",
      "LOVE": "number"
    },
    "userReaction": "string or null",
    "canEdit": "boolean",
    "canDelete": "boolean"
  }
]
```

### 6.2 Создать комментарий
**POST** `/api/activities/{id}/comments`

Создать комментарий к активности.

**Path Parameters:**
- `id` - идентификатор активности

**Headers:**
- `Authorization: Bearer <token>`

**Request Body:**
```json
{
  "text": "string"
}
```

**Response:** `200 OK`

### 6.3 Обновить комментарий
**PUT** `/api/comments/{id}`

Обновить текст комментария.

**Path Parameters:**
- `id` - идентификатор комментария

**Headers:**
- `Authorization: Bearer <token>`

**Request Body:**
```json
{
  "text": "string"
}
```

**Response:** `200 OK`

### 6.4 Удалить комментарий
**DELETE** `/api/comments/{id}`

Удалить комментарий.

**Path Parameters:**
- `id` - идентификатор комментария

**Headers:**
- `Authorization: Bearer <token>`

**Response:** `200 OK`

### 6.5 Добавить реакцию на комментарий
**POST** `/api/comments/{id}/reactions`

Добавить или обновить реакцию на комментарий.

**Path Parameters:**
- `id` - идентификатор комментария

**Headers:**
- `Authorization: Bearer <token>`

**Request Body:**
```json
{
  "reactionType": "LIKE | LOVE | FIRE"
}
```

**Response:** `200 OK`

### 6.6 Удалить реакцию с комментария
**DELETE** `/api/comments/{id}/reactions`

Удалить свою реакцию с комментария.

**Path Parameters:**
- `id` - идентификатор комментария

**Headers:**
- `Authorization: Bearer <token>`

**Response:** `200 OK`

---

## 7. Реакции на активности (Activity Reactions)

### 7.1 Получить реакции активности
**GET** `/api/activities/{id}/reactions`

Получить все реакции на активность.

**Path Parameters:**
- `id` - идентификатор активности

**Headers:**
- `Authorization: Bearer <token>` (optional)

**Response:** `200 OK`
```json
{
  "reactions": {
    "LIKE": "number",
    "LOVE": "number",
    "FIRE": "number"
  },
  "userReaction": "string or null"
}
```

### 7.2 Добавить реакцию на активность
**POST** `/api/activities/{id}/reactions`

Добавить или обновить реакцию на активность.

**Path Parameters:**
- `id` - идентификатор активности

**Headers:**
- `Authorization: Bearer <token>`

**Request Body:**
```json
{
  "reactionType": "LIKE | LOVE | FIRE"
}
```

**Response:** `200 OK`

### 7.3 Удалить реакцию с активности
**DELETE** `/api/activities/{id}/reactions`

Удалить свою реакцию с активности.

**Path Parameters:**
- `id` - идентификатор активности

**Headers:**
- `Authorization: Bearer <token>`

**Response:** `200 OK`

---

## 8. Приглашения в команду (Team Invitations)

### 8.1 Получить приглашения участника
**GET** `/api/participants/{participantId}/invitations`

Получить все приглашения участника в команды.

**Path Parameters:**
- `participantId` - идентификатор участника

**Response:** `200 OK`
```json
[
  {
    "id": "number",
    "teamId": "number",
    "teamName": "string",
    "invitedBy": {
      "id": "number",
      "name": "string"
    },
    "message": "string",
    "status": "PENDING | ACCEPTED | DECLINED",
    "createdAt": "string (ISO 8601)"
  }
]
```

### 8.2 Создать приглашение
**POST** `/api/teams/{teamId}/invite`

Пригласить участника в команду.

**Path Parameters:**
- `teamId` - идентификатор команды

**Headers:**
- `Authorization: Bearer <token>`

**Request Body:**
```json
{
  "participantId": "number",
  "message": "string"
}
```

**Response:** `201 Created`

### 8.3 Принять приглашение
**POST** `/api/invitations/{invitationId}/accept`

Принять приглашение в команду.

**Path Parameters:**
- `invitationId` - идентификатор приглашения

**Headers:**
- `Authorization: Bearer <token>`

**Response:** `200 OK`

### 8.4 Отклонить приглашение
**POST** `/api/invitations/{invitationId}/decline`

Отклонить приглашение в команду.

**Path Parameters:**
- `invitationId` - идентификатор приглашения

**Headers:**
- `Authorization: Bearer <token>`

**Response:** `200 OK`

---

## 9. Уведомления (Notifications)

### 9.1 Получить все уведомления
**GET** `/api/notifications`

Получить все уведомления текущего пользователя.

**Headers:**
- `Authorization: Bearer <token>`

**Response:** `200 OK`
```json
[
  {
    "id": "number",
    "title": "string",
    "message": "string",
    "type": "string",
    "isRead": "boolean",
    "createdAt": "string (ISO 8601)",
    "relatedEntityId": "number",
    "relatedEntityType": "string"
  }
]
```

### 9.2 Получить непрочитанные уведомления
**GET** `/api/notifications/unread`

Получить только непрочитанные уведомления.

**Headers:**
- `Authorization: Bearer <token>`

**Response:** `200 OK` - массив уведомлений

### 9.3 Получить количество непрочитанных
**GET** `/api/notifications/unread/count`

Получить количество непрочитанных уведомлений.

**Headers:**
- `Authorization: Bearer <token>`

**Response:** `200 OK`
```json
5
```

### 9.4 Отметить как прочитанное
**PUT** `/api/notifications/{id}/read`

Отметить уведомление как прочитанное.

**Path Parameters:**
- `id` - идентификатор уведомления

**Headers:**
- `Authorization: Bearer <token>`

**Response:** `200 OK`

### 9.5 Отметить все как прочитанные
**PUT** `/api/notifications/read-all`

Отметить все уведомления как прочитанные.

**Headers:**
- `Authorization: Bearer <token>`

**Response:** `200 OK`

### 9.6 Удалить уведомление
**DELETE** `/api/notifications/{id}`

Удалить уведомление.

**Path Parameters:**
- `id` - идентификатор уведомления

**Headers:**
- `Authorization: Bearer <token>`

**Response:** `200 OK`

### 9.7 Отправить уведомления (админ/модератор)
**POST** `/api/notifications/admin/send`

Отправить уведомления от администратора.

**Headers:**
- `Authorization: Bearer <token>`
- Требуется роль: ADMIN или MODERATOR

**Request Body:**
```json
{
  "title": "string",
  "message": "string",
  "targetType": "ALL | TEAM | EVENT",
  "targetId": "number (optional, для TEAM или EVENT)"
}
```

**Response:** `200 OK`
```json
{
  "success": true,
  "count": "number",
  "message": "string"
}
```

---

## 10. Отчеты об ошибках (Bug Reports)

### 10.1 Создать отчет об ошибке
**POST** `/api/bug-reports`

Создать новый отчет об ошибке.

**Headers:**
- `Authorization: Bearer <token>`

**Request Body:**
```json
{
  "title": "string",
  "description": "string",
  "priority": "LOW | MEDIUM | HIGH"
}
```

**Response:** `201 Created`
```json
{
  "id": "number",
  "title": "string",
  "description": "string",
  "priority": "string",
  "status": "OPEN",
  "reportedBy": {...},
  "createdAt": "string (ISO 8601)"
}
```

### 10.2 Получить мои отчеты
**GET** `/api/bug-reports/my`

Получить все отчеты текущего пользователя.

**Headers:**
- `Authorization: Bearer <token>`

**Response:** `200 OK` - массив отчетов

### 10.3 Получить все отчеты (админ)
**GET** `/api/admin/bug-reports`

Получить все отчеты об ошибках.

**Headers:**
- `Authorization: Bearer <token>`
- Требуется роль: ADMIN

**Response:** `200 OK` - массив отчетов

### 10.4 Обновить статус отчета (админ)
**PUT** `/api/admin/bug-reports/{id}`

Обновить статус отчета об ошибке.

**Path Parameters:**
- `id` - идентификатор отчета

**Query Parameters:**
- `status` (required) - новый статус (OPEN, IN_PROGRESS, RESOLVED, CLOSED)
- `adminNotes` (optional) - заметки администратора
- `awardBadge` (optional) - наградить значком (true/false)

**Headers:**
- `Authorization: Bearer <token>`
- Требуется роль: ADMIN

**Response:** `200 OK`

### 10.5 Удалить отчет (админ)
**DELETE** `/api/admin/bug-reports/{id}`

Удалить отчет об ошибке.

**Path Parameters:**
- `id` - идентификатор отчета

**Headers:**
- `Authorization: Bearer <token>`
- Требуется роль: ADMIN

**Response:** `200 OK`

### 10.6 Получить значки участника
**GET** `/api/participants/{id}/badges`

Получить все значки участника.

**Path Parameters:**
- `id` - идентификатор участника

**Response:** `200 OK`
```json
[
  {
    "id": "number",
    "badgeType": "string",
    "awardedAt": "string (ISO 8601)",
    "awardedBy": {
      "id": "number",
      "name": "string"
    }
  }
]
```

---

## 11. Модерация (Moderation)

### 11.1 Проверить включена ли модерация
**GET** `/api/moderation/enabled`

Проверить, есть ли события с включенной модерацией.

**Headers:**
- `Authorization: Bearer <token>`
- Требуется роль: MODERATOR или ADMIN

**Response:** `200 OK`
```json
true
```

### 11.2 Получить активности на модерации
**GET** `/api/moderation/activities/pending`

Получить список активностей, ожидающих модерации.

**Query Parameters:**
- `eventId` (optional) - фильтр по событию
- `teamId` (optional) - фильтр по команде
- `page` (optional, default: 0) - номер страницы
- `size` (optional, default: 20) - размер страницы

**Headers:**
- `Authorization: Bearer <token>`
- Требуется роль: MODERATOR или ADMIN

**Response:** `200 OK`
```json
[
  {
    "id": "number",
    "teamName": "string",
    "type": "string",
    "energy": "number",
    "description": "string",
    "createdAt": "string (ISO 8601)",
    "participants": [...],
    "photos": [...]
  }
]
```

### 11.3 Одобрить активность
**POST** `/api/moderation/activities/{id}/approve`

Одобрить активность с возможностью добавления бонусов/штрафов.

**Path Parameters:**
- `id` - идентификатор активности

**Query Parameters:**
- `bonusTypeId` (optional) - ID типа бонуса
- `penaltyTypeId` (optional) - ID типа штрафа
- `comment` (optional) - комментарий модератора

**Headers:**
- `Authorization: Bearer <token>`
- Требуется роль: MODERATOR или ADMIN

**Response:** `200 OK`

### 11.4 Отклонить активность
**POST** `/api/moderation/activities/{id}/reject`

Отклонить активность с указанием причины.

**Path Parameters:**
- `id` - идентификатор активности

**Query Parameters:**
- `penaltyTypeId` (optional) - ID типа штрафа

**Headers:**
- `Authorization: Bearer <token>`
- Требуется роль: MODERATOR или ADMIN

**Request Body:**
```json
{
  "reason": "string"
}
```

**Response:** `200 OK`

### 11.5 Получить статистику модерации
**GET** `/api/moderation/stats`

Получить статистику работы модератора.

**Headers:**
- `Authorization: Bearer <token>`
- Требуется роль: MODERATOR или ADMIN

**Response:** `200 OK`
```json
{
  "totalReviewed": "number",
  "approved": "number",
  "rejected": "number",
  "pending": "number"
}
```

### 11.6 Получить типы бонусов
**GET** `/api/moderation/bonus-types`

Получить список типов бонусов для события.

**Query Parameters:**
- `eventId` (required) - идентификатор события

**Headers:**
- `Authorization: Bearer <token>`
- Требуется роль: MODERATOR или ADMIN

**Response:** `200 OK`
```json
[
  {
    "id": "number",
    "name": "string",
    "description": "string",
    "pointsAdjustment": "number",
    "type": "BONUS | PENALTY"
  }
]
```

---

## 12. Типы активностей (Activity Types)

### 12.1 Получить все типы активностей
**GET** `/api/activity-types`

Получить все типы активностей или для конкретного события.

**Query Parameters:**
- `eventId` (optional) - фильтр по событию

**Response:** `200 OK`
```json
[
  {
    "id": "number",
    "name": "string",
    "description": "string",
    "defaultEnergy": "number"
  }
]
```

### 12.2 Получить тип активности по ID
**GET** `/api/activity-types/{id}`

Получить конкретный тип активности.

**Path Parameters:**
- `id` - идентификатор типа активности

**Response:** `200 OK`

### 12.3 Создать тип активности
**POST** `/api/activity-types`

Создать новый тип активности.

**Request Body:**
```json
{
  "name": "string",
  "description": "string",
  "defaultEnergy": "number",
  "eventId": "number (optional)"
}
```

**Response:** `200 OK`

### 12.4 Обновить тип активности
**PUT** `/api/activity-types/{id}`

Обновить существующий тип активности.

**Path Parameters:**
- `id` - идентификатор типа активности

**Request Body:**
```json
{
  "name": "string",
  "description": "string",
  "defaultEnergy": "number"
}
```

**Response:** `200 OK`

### 12.5 Удалить тип активности
**DELETE** `/api/activity-types/{id}`

Удалить тип активности.

**Path Parameters:**
- `id` - идентификатор типа активности

**Response:** `200 OK`

---

## 13. Типы бонусов (Bonus Types)

### 13.1 Получить типы бонусов по событию
**GET** `/api/bonus-types`

Получить все активные типы бонусов для события.

**Query Parameters:**
- `eventId` (required) - идентификатор события

**Headers:**
- `Authorization: Bearer <token>`
- Требуется роль: ADMIN или MODERATOR

**Response:** `200 OK`

### 13.2 Создать тип бонуса
**POST** `/api/bonus-types`

Создать новый тип бонуса или штрафа.

**Headers:**
- `Authorization: Bearer <token>`
- Требуется роль: ADMIN

**Request Body:**
```json
{
  "eventId": "number",
  "name": "string",
  "description": "string",
  "pointsAdjustment": "number",
  "type": "BONUS | PENALTY"
}
```

**Response:** `201 Created`

### 13.3 Обновить тип бонуса
**PUT** `/api/bonus-types/{id}`

Обновить существующий тип бонуса.

**Path Parameters:**
- `id` - идентификатор типа бонуса

**Headers:**
- `Authorization: Bearer <token>`
- Требуется роль: ADMIN

**Request Body:**
```json
{
  "name": "string",
  "description": "string",
  "pointsAdjustment": "number",
  "type": "BONUS | PENALTY"
}
```

**Response:** `200 OK`

### 13.4 Удалить тип бонуса
**DELETE** `/api/bonus-types/{id}`

Деактивировать тип бонуса (мягкое удаление).

**Path Parameters:**
- `id` - идентификатор типа бонуса

**Headers:**
- `Authorization: Bearer <token>`
- Требуется роль: ADMIN

**Response:** `200 OK`

---

## 14. Приглашения в события (Event Invitations)

### 14.1 Пригласить участников в событие (админ)
**POST** `/api/admin/events/invite`

Пригласить участников в событие.

**Headers:**
- `Authorization: Bearer <token>`
- Требуется роль: ADMIN

**Request Body:**
```json
{
  "eventId": "number",
  "participantIds": ["number"]
}
```

**Response:** `201 Created`

### 14.2 Получить участников события
**GET** `/api/events/{eventId}/participants`

Получить список участников события.

**Path Parameters:**
- `eventId` - идентификатор события

**Response:** `200 OK`

### 14.3 Получить мои приглашения в события
**GET** `/api/participants/event-invitations`

Получить приглашения текущего пользователя в события.

**Headers:**
- `Authorization: Bearer <token>`

**Response:** `200 OK`

### 14.4 Принять приглашение в событие
**POST** `/api/event-invitations/{id}/accept`

Принять приглашение в событие.

**Path Parameters:**
- `id` - идентификатор приглашения

**Headers:**
- `Authorization: Bearer <token>`

**Response:** `200 OK`

### 14.5 Отклонить приглашение в событие
**POST** `/api/event-invitations/{id}/decline`

Отклонить приглашение в событие.

**Path Parameters:**
- `id` - идентификатор приглашения

**Headers:**
- `Authorization: Bearer <token>`

**Response:** `200 OK`

---

## 15. Админ панель (Admin)

### 15.1 Получить всех участников
**GET** `/api/admin/participants`

Получить список всех участников системы.

**Headers:**
- `Authorization: Bearer <token>`
- Требуется роль: ADMIN

**Response:** `200 OK`

### 15.2 Создать участника
**POST** `/api/admin/participants`

Создать нового участника.

**Headers:**
- `Authorization: Bearer <token>`
- Требуется роль: ADMIN

**Request Body:**
```json
{
  "username": "string",
  "password": "string",
  "name": "string",
  "email": "string",
  "phone": "string",
  "role": "USER | MODERATOR | ADMIN"
}
```

**Response:** `201 Created`

### 15.3 Обновить участника
**PUT** `/api/admin/participants/{id}`

Обновить данные участника.

**Path Parameters:**
- `id` - идентификатор участника

**Headers:**
- `Authorization: Bearer <token>`
- Требуется роль: ADMIN

**Request Body:**
```json
{
  "name": "string",
  "email": "string",
  "phone": "string",
  "role": "USER | MODERATOR | ADMIN"
}
```

**Response:** `200 OK`

### 15.4 Сбросить пароль участника
**POST** `/api/admin/participants/{id}/reset-password`

Сбросить пароль участника на username.

**Path Parameters:**
- `id` - идентификатор участника

**Headers:**
- `Authorization: Bearer <token>`
- Требуется роль: ADMIN

**Response:** `200 OK`

### 15.5 Удалить участника
**DELETE** `/api/admin/participants/{id}`

Удалить участника из системы.

**Path Parameters:**
- `id` - идентификатор участника

**Headers:**
- `Authorization: Bearer <token>`
- Требуется роль: ADMIN

**Response:** `204 No Content`

### 15.6 Получить все команды (админ)
**GET** `/api/admin/teams`

Получить список всех команд.

**Headers:**
- `Authorization: Bearer <token>`
- Требуется роль: ADMIN

**Response:** `200 OK`

### 15.7 Создать команду (админ)
**POST** `/api/admin/teams`

Создать новую команду.

**Headers:**
- `Authorization: Bearer <token>`
- Требуется роль: ADMIN

**Request Body:**
```json
{
  "name": "string",
  "motto": "string",
  "imageUrl": "string",
  "eventId": "number (optional)"
}
```

**Response:** `201 Created`

### 15.8 Удалить команду (админ)
**DELETE** `/api/admin/teams/{id}`

Удалить команду.

**Path Parameters:**
- `id` - идентификатор команды

**Headers:**
- `Authorization: Bearer <token>`
- Требуется роль: ADMIN

**Response:** `204 No Content`

### 15.9 Получить все типы активностей (админ)
**GET** `/api/admin/activity-types`

Получить все типы активностей.

**Headers:**
- `Authorization: Bearer <token>`
- Требуется роль: ADMIN

**Response:** `200 OK`

### 15.10 Создать тип активности (админ)
**POST** `/api/admin/activity-types`

Создать новый тип активности.

**Headers:**
- `Authorization: Bearer <token>`
- Требуется роль: ADMIN

**Request Body:**
```json
{
  "name": "string",
  "description": "string",
  "defaultEnergy": "number",
  "eventId": "number (optional)"
}
```

**Response:** `201 Created`

### 15.11 Удалить тип активности (админ)
**DELETE** `/api/admin/activity-types/{id}`

Удалить тип активности.

**Path Parameters:**
- `id` - идентификатор типа активности

**Headers:**
- `Authorization: Bearer <token>`
- Требуется роль: ADMIN

**Response:** `204 No Content`

### 15.12 Получить все события (админ)
**GET** `/api/admin/events`

Получить все события.

**Headers:**
- `Authorization: Bearer <token>`
- Требуется роль: ADMIN

**Response:** `200 OK`

### 15.13 Создать событие
**POST** `/api/admin/events`

Создать новое событие.

**Headers:**
- `Authorization: Bearer <token>`
- Требуется роль: ADMIN

**Request Body:**
```json
{
  "name": "string",
  "description": "string",
  "startDate": "string (ISO 8601)",
  "endDate": "string (ISO 8601)",
  "isActive": "boolean",
  "displayOnHomepage": "boolean",
  "requiresModeration": "boolean"
}
```

**Response:** `201 Created`

### 15.14 Обновить событие
**PUT** `/api/admin/events/{id}`

Обновить событие.

**Path Parameters:**
- `id` - идентификатор события

**Headers:**
- `Authorization: Bearer <token>`
- Требуется роль: ADMIN

**Request Body:**
```json
{
  "name": "string",
  "description": "string",
  "startDate": "string (ISO 8601)",
  "endDate": "string (ISO 8601)",
  "isActive": "boolean",
  "displayOnHomepage": "boolean",
  "requiresModeration": "boolean"
}
```

**Response:** `200 OK`

### 15.15 Удалить событие
**DELETE** `/api/admin/events/{id}`

Удалить событие.

**Path Parameters:**
- `id` - идентификатор события

**Headers:**
- `Authorization: Bearer <token>`
- Требуется роль: ADMIN

**Response:** `204 No Content`

### 15.16 Установить событие на главной
**POST** `/api/admin/events/{id}/display`

Установить событие для отображения на главной странице.

**Path Parameters:**
- `id` - идентификатор события

**Headers:**
- `Authorization: Bearer <token>`
- Требуется роль: ADMIN

**Response:** `200 OK`

### 15.17 Скрыть событие с главной
**POST** `/api/admin/events/{id}/hide`

Скрыть событие с главной страницы.

**Path Parameters:**
- `id` - идентификатор события

**Headers:**
- `Authorization: Bearer <token>`
- Требуется роль: ADMIN

**Response:** `204 No Content`

---

## Коды ошибок

### Стандартные HTTP коды

- **200 OK** - Успешный запрос
- **201 Created** - Ресурс успешно создан
- **204 No Content** - Успешный запрос без тела ответа
- **400 Bad Request** - Некорректные данные запроса
- **401 Unauthorized** - Требуется аутентификация
- **403 Forbidden** - Недостаточно прав доступа
- **404 Not Found** - Ресурс не найден
- **500 Internal Server Error** - Внутренняя ошибка сервера

### Формат ошибок

```json
{
  "timestamp": "string (ISO 8601)",
  "status": "number",
  "error": "string",
  "message": "string",
  "path": "string"
}
```

---

## Примечания для тестирования

### Последовательность тестирования

1. **Аутентификация**
   - Зарегистрировать пользователя
   - Получить JWT токен через логин
   - Использовать токен для всех последующих запросов

2. **Создание базовых сущностей**
   - Создать событие (админ)
   - Создать типы активностей
   - Создать команду
   - Пригласить участников

3. **Работа с активностями**
   - Создать активность
   - Добавить фото
   - Добавить участников
   - Добавить комментарии и реакции

4. **Модерация** (если включена)
   - Получить список активностей на модерации
   - Одобрить/отклонить активности
   - Применить бонусы/штрафы

5. **Уведомления**
   - Проверить получение уведомлений
   - Отметить как прочитанные
   - Отправить массовые уведомления (админ)

### Тестовые данные

Рекомендуется создать следующие тестовые роли:
- **Администратор** - полный доступ ко всем функциям
- **Модератор** - доступ к модерации активностей
- **Обычный пользователь** - базовые функции

### Переменные окружения для тестов

```
BASE_URL=http://localhost:8080
ADMIN_TOKEN=<admin_jwt_token>
MODERATOR_TOKEN=<moderator_jwt_token>
USER_TOKEN=<user_jwt_token>
```
