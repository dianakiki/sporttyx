# Liquibase Database Migrations

Этот проект использует Liquibase для управления схемой базы данных.

## Структура миграций

```
backend/src/main/resources/db/changelog/
├── db.changelog-master.yaml          # Главный файл, включающий все миграции
└── changes/
    ├── 001-create-participants-table.yaml
    ├── 002-create-teams-table.yaml
    ├── 003-create-team-participants-table.yaml
    ├── 004-create-activities-table.yaml
    └── 005-create-team-invitations-table.yaml
```

## Что делает Liquibase

1. **Автоматически создает таблицы** при первом запуске приложения
2. **Отслеживает выполненные миграции** в таблице `databasechangelog`
3. **Предотвращает повторное выполнение** уже примененных миграций
4. **Обеспечивает версионирование** схемы базы данных

## Созданные таблицы

### 1. participants
- Хранит информацию об участниках
- Поля: id, username, password, name, email, phone, profile_image_url, created_at

### 2. teams
- Хранит информацию о командах
- Поля: id, name, motto, image_url, created_at

### 3. team_participants
- Связь многие-ко-многим между командами и участниками
- Поля: id, team_id, participant_id, role, joined_at
- Индексы для оптимизации запросов

### 4. activities
- Хранит активности участников
- Поля: id, team_id, participant_id, type, energy, photo_url, created_at
- Индексы для быстрого поиска по команде, участнику и дате

### 5. team_invitations
- Система приглашений в команды
- Поля: id, team_id, participant_id, invited_by_id, status, invited_at, responded_at
- Индексы для поиска приглашений

## Как добавить новую миграцию

1. Создайте новый файл в `db/changelog/changes/`:
```yaml
# 006-add-new-column.yaml
databaseChangeLog:
  - changeSet:
      id: 006-add-new-column
      author: your-name
      changes:
        - addColumn:
            tableName: participants
            columns:
              - column:
                  name: new_column
                  type: VARCHAR(100)
```

2. Добавьте ссылку в `db.changelog-master.yaml`:
```yaml
  - include:
      file: db/changelog/changes/006-add-new-column.yaml
```

3. Перезапустите приложение - миграция выполнится автоматически

## Полезные команды

### Проверить статус миграций
```sql
SELECT * FROM databasechangelog ORDER BY dateexecuted DESC;
```

### Откатить последнюю миграцию (вручную)
```sql
DELETE FROM databasechangelog WHERE id = '006-add-new-column';
-- Затем вручную откатите изменения в схеме
```

### Очистить все миграции (для разработки)
```sql
DROP TABLE databasechangelog;
DROP TABLE databasechangeloglock;
-- Затем перезапустите приложение
```

## Преимущества Liquibase

✅ **Версионный контроль** схемы базы данных  
✅ **Автоматическое применение** миграций при деплое  
✅ **Независимость от БД** (работает с PostgreSQL, MySQL, Oracle и др.)  
✅ **Откат изменений** при необходимости  
✅ **Командная работа** без конфликтов в схеме  

## Настройки в application.properties

```properties
# Включить Liquibase
spring.liquibase.enabled=true

# Путь к главному changelog файлу
spring.liquibase.change-log=classpath:db/changelog/db.changelog-master.yaml

# Hibernate только проверяет схему, не изменяет её
spring.jpa.hibernate.ddl-auto=validate
```

## Troubleshooting

### Ошибка: "Table already exists"
Liquibase пытается создать таблицу, которая уже существует.
**Решение**: Удалите существующие таблицы или используйте `spring.liquibase.drop-first=true` (только для разработки!)

### Ошибка: "Validation Failed"
Hibernate обнаружил несоответствие между Entity классами и схемой БД.
**Решение**: Убедитесь, что миграции соответствуют вашим Entity классам.

### Миграция не применяется
**Решение**: Проверьте таблицу `databasechangelog` - возможно, миграция уже выполнена.
