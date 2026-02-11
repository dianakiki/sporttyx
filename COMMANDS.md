# 📋 Шпаргалка по командам Sporttyx

## Frontend (React)

### Запуск и остановка
```bash
# Запустить dev сервер
cd frontend
npm start

# Остановить все React процессы
pkill -f react-scripts

# Перезапустить (полностью)
pkill -f react-scripts && npm start
```

### Управление пакетами
```bash
# Установить новые пакеты
npm install <package-name>

# Установить все зависимости
npm install

# Собрать production build
npm run build
```

### Адреса
- **Local**: http://localhost:3001
- **Network**: http://192.168.0.59:3001

---

## Backend (Spring Boot)

### Через Maven (локально)
```bash
cd backend

# Собрать проект
mvn clean package -DskipTests

# Запустить
mvn spring-boot:run
```

### Через Docker Compose (рекомендуется)
```bash
cd /Users/diana/Desktop/w/sporttyx

# Запустить все сервисы (postgres, backend, frontend)
docker-compose up -d

# Перезапустить только backend
docker-compose restart backend

# Пересобрать и запустить backend после изменений в коде
mvn clean package -DskipTests -f backend/pom.xml
docker-compose build backend
docker-compose up -d backend

# Посмотреть логи backend
docker-compose logs -f backend

# Посмотреть логи всех сервисов
docker-compose logs -f

# Остановить все сервисы
docker-compose down

# Остановить и удалить volumes (БД будет очищена!)
docker-compose down -v
```

### Адреса
- **Backend API**: http://localhost:8082
- **PostgreSQL**: localhost:5432

---

## База данных (PostgreSQL)

### Подключение
```bash
# Через docker-compose
docker-compose exec postgres psql -U postgres -d sporttyx_db

# Локально (если установлен psql)
psql -h localhost -p 5432 -U postgres -d sporttyx_db
```

### Параметры подключения
- **Host**: localhost
- **Port**: 5432
- **Database**: sporttyx_db
- **User**: postgres
- **Password**: postgres

---

## Полезные команды

### Проверка портов
```bash
# Проверить что запущено на портах
lsof -i :3001  # Frontend
lsof -i :8082  # Backend
lsof -i :5432  # PostgreSQL

# Убить процесс на порту (если нужно)
lsof -ti :3001 | xargs kill -9
```

### Очистка кэша браузера
- **Жесткая перезагрузка**: `Cmd+Shift+R` (Mac) или `Ctrl+Shift+R` (Windows)
- **Открыть консоль разработчика**: `F12` или `Cmd+Option+I` (Mac)
- **Режим инкогнито**: `Cmd+Shift+N` (Mac) или `Ctrl+Shift+N` (Windows)

### Git
```bash
# Посмотреть статус
git status

# Добавить все изменения
git add .

# Коммит
git commit -m "Описание изменений"

# Пуш
git push
```

---

## Быстрые действия

### Полный перезапуск всего проекта
```bash
# Остановить frontend
pkill -f react-scripts

# Перезапустить docker сервисы
docker-compose down
docker-compose up -d

# Запустить frontend
cd frontend && npm start
```

### Пересборка backend после изменений в Java коде
```bash
# 1. Собрать JAR
cd backend
mvn clean package -DskipTests

# 2. Пересобрать и запустить Docker контейнер
cd ..
docker-compose build backend
docker-compose up -d backend

# 3. Проверить логи
docker-compose logs -f backend
```

### Сброс базы данных
```bash
# Остановить и удалить все (включая данные БД)
docker-compose down -v

# Запустить заново (БД будет пустая)
docker-compose up -d
```

---

## Структура проекта

```
sporttyx/
├── frontend/              # React приложение (порт 3001)
│   ├── public/           # Статические файлы
│   ├── src/
│   │   ├── components/   # UI компоненты
│   │   │   ├── ui/      # Базовые компоненты (Button, Input)
│   │   │   ├── LoginForm.tsx
│   │   │   ├── RegistrationForm.tsx
│   │   │   ├── ParticipantProfile.tsx
│   │   │   ├── AddTeamForm.tsx
│   │   │   ├── AddActivityForm.tsx
│   │   │   ├── TeamProfile.tsx
│   │   │   ├── TeamTracker.tsx
│   │   │   └── DevNavigation.tsx
│   │   ├── api/         # API запросы
│   │   ├── App.tsx      # Главный компонент с роутингом
│   │   └── index.css    # Глобальные стили
│   ├── package.json
│   └── .env
│
├── backend/              # Spring Boot (порт 8082)
│   ├── src/main/java/com/app/
│   │   ├── config/      # Конфигурация (SecurityConfig)
│   │   ├── controller/  # REST контроллеры
│   │   ├── model/       # Entity классы
│   │   ├── repository/  # JPA репозитории
│   │   ├── service/     # Бизнес-логика
│   │   └── SporttyxApplication.java
│   ├── src/main/resources/
│   │   └── application.properties
│   ├── pom.xml
│   └── Dockerfile
│
├── docker-compose.yml    # Конфигурация Docker
├── COMMANDS.md          # Эта шпаргалка
├── DEVELOPMENT.md       # Документация по разработке
└── UI_COMPONENTS.md     # Документация UI компонентов
```

---

## Troubleshooting

### Frontend не запускается
```bash
# Удалить node_modules и переустановить
cd frontend
rm -rf node_modules package-lock.json
npm install
npm start
```

### Backend не запускается в Docker
```bash
# Посмотреть логи
docker-compose logs backend

# Пересобрать с нуля
mvn clean package -DskipTests -f backend/pom.xml
docker-compose build --no-cache backend
docker-compose up -d backend
```

### Изменения не видны в браузере
1. Сделать жесткую перезагрузку: `Cmd+Shift+R`
2. Очистить кэш браузера: `Cmd+Shift+Delete`
3. Открыть в режиме инкогнито
4. Проверить что frontend запущен на правильном порту (3001)

### Ошибка подключения к БД
```bash
# Проверить что PostgreSQL запущен
docker-compose ps

# Перезапустить БД
docker-compose restart postgres

# Проверить логи
docker-compose logs postgres
```

---

## Полезные ссылки

- **Frontend**: http://localhost:3001
- **Backend API**: http://localhost:8082
- **Swagger UI** (если настроен): http://localhost:8082/swagger-ui.html
- **H2 Console** (если используется): http://localhost:8082/h2-console

---

## Примечания

- Frontend работает на порту **3001** (не 3000!)
- Backend проксируется через frontend (настроено в package.json)
- Для разработки авторизация временно отключена
- Spring Security HTTP Basic Authentication отключен в SecurityConfig
