# Sporttyx Backend API

Backend API для приложения Sporttyx, построенный на Spring Boot с PostgreSQL.

## Технологии

- **Java 11**
- **Spring Boot 2.7.18**
- **Spring Security** с JWT аутентификацией
- **Spring Data JPA** с Hibernate
- **PostgreSQL** база данных
- **Lombok** для упрощения кода
- **Maven** для управления зависимостями

## Требования

- Java 11 или выше
- Maven 3.6+
- PostgreSQL 12+

## Настройка базы данных

1. Установите PostgreSQL
2. Создайте базу данных:
```sql
CREATE DATABASE sporttyx_db;
```

3. Обновите настройки подключения в `src/main/resources/application.properties`:
```properties
spring.datasource.url=jdbc:postgresql://localhost:5432/sporttyx_db
spring.datasource.username=postgres
spring.datasource.password=your_password
```

## Запуск приложения

### Через Maven:
```bash
cd backend
mvn clean install
mvn spring-boot:run
```

### Через JAR:
```bash
mvn clean package
java -jar target/backend-1.0-SNAPSHOT.jar
```

Приложение запустится на `http://localhost:8080`

## API Endpoints

### Authentication
- `POST /api/auth/register` - Регистрация нового пользователя
- `POST /api/auth/login` - Вход в систему

### Participants
- `GET /api/participants/{id}` - Получить профиль участника
- `PUT /api/participants/{id}` - Обновить профиль
- `DELETE /api/participants/{id}` - Удалить профиль
- `GET /api/participants/search?query={searchTerm}` - Поиск участников

### Teams
- `GET /api/teams` - Список всех команд
- `GET /api/teams/{id}` - Детали команды
- `POST /api/teams` - Создать команду
- `PUT /api/teams/{id}` - Обновить команду
- `DELETE /api/teams/{id}` - Удалить команду
- `POST /api/teams/{teamId}/leave` - Покинуть команду
- `GET /api/teams/{id}/participants` - Участники команды
- `GET /api/teams/rankings` - Рейтинг команд

### Activities
- `GET /api/teams/{teamId}/activities` - Активности команды
- `POST /api/activities` - Создать активность (multipart/form-data)

### Invitations
- `GET /api/participants/{participantId}/invitations` - Приглашения участника
- `POST /api/teams/{teamId}/invite` - Пригласить в команду
- `POST /api/invitations/{invitationId}/accept` - Принять приглашение
- `POST /api/invitations/{invitationId}/decline` - Отклонить приглашение

## Аутентификация

Все endpoints (кроме `/api/auth/**`) требуют JWT токен в заголовке:
```
Authorization: Bearer <jwt_token>
```

## Структура проекта

```
backend/
├── src/main/java/com/app/
│   ├── controller/      # REST контроллеры
│   ├── dto/            # Data Transfer Objects
│   ├── model/          # Entity классы
│   ├── repository/     # JPA репозитории
│   ├── security/       # JWT и Security конфигурация
│   ├── service/        # Бизнес-логика
│   └── SporttyxApplication.java
├── src/main/resources/
│   ├── application.properties
│   └── schema.sql
└── pom.xml
```

## Docker

Для запуска через Docker:
```bash
docker-compose up -d
```

## Разработка

При разработке используется `spring-boot-devtools` для автоматической перезагрузки.

Hibernate автоматически создаст таблицы при первом запуске (`spring.jpa.hibernate.ddl-auto=update`).

## Загрузка файлов

Фотографии активностей сохраняются в директорию `uploads/activities/`.
Максимальный размер файла: 10MB.

text