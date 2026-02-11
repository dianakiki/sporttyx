# Development Guide / Руководство по разработке

## Local Frontend Development / Локальная разработка Frontend

### Запуск frontend локально с hot-reload:

1. **Запустите только backend и базу данных в Docker:**
   ```bash
   cd /Users/diana/Desktop/w/sporttyx
   docker-compose up -d postgres backend
   ```

2. **Запустите frontend локально:**
   ```bash
   cd frontend
   npm start
   ```

Frontend запустится на **http://localhost:3001** с автоматической перезагрузкой при изменении файлов.

### Как это работает:

- **Backend и PostgreSQL** работают в Docker (порты 8082 и 5432)
- **Frontend** работает локально на порту 3001
- Настроен **proxy** в `package.json` - все API запросы автоматически перенаправляются на `http://localhost:8082`
- При изменении кода frontend автоматически перезагружается (hot-reload)
- Не нужно пересобирать Docker образы при каждом изменении

### Преимущества:

✅ Мгновенная перезагрузка при изменениях (hot-reload)  
✅ Не нужно пересобирать Docker образы  
✅ Быстрая разработка и отладка  
✅ Доступ к React DevTools в браузере  

---

## Full Stack in Docker / Полный стек в Docker

Для production или полного тестирования:

```bash
cd /Users/diana/Desktop/w/sporttyx
docker-compose up -d --build
```

Доступ:
- Frontend: http://localhost:3000
- Backend: http://localhost:8082
- PostgreSQL: localhost:5432

---

## Полезные команды:

```bash
# Остановить все контейнеры
docker-compose down

# Посмотреть логи backend
docker-compose logs -f backend

# Посмотреть логи PostgreSQL
docker-compose logs -f postgres

# Перезапустить только backend после изменений
docker-compose up -d --build backend

# Остановить все и удалить данные БД
docker-compose down -v
```

---

## Структура портов:

| Сервис     | Docker | Local Dev |
|------------|--------|-----------|
| Frontend   | 3000   | 3001      |
| Backend    | 8082   | 8082      |
| PostgreSQL | 5432   | 5432      |

---

## Настройка IntelliJ IDEA:

### Для запуска frontend из IDE:

1. Откройте **Run → Edit Configurations**
2. Нажмите **+** → **npm**
3. Настройте:
   - **Name:** Frontend Dev Server
   - **Command:** start
   - **Scripts:** start
   - **Working directory:** `/Users/diana/Desktop/w/sporttyx/frontend`
4. Нажмите **OK** и запустите

Теперь можно запускать frontend прямо из IDEA с кнопки Run!

---

## Backend Development:

Backend можно запускать локально через IDEA, если нужно отладить:

1. Убедитесь, что PostgreSQL запущен: `docker-compose up -d postgres`
2. Запустите `SporttyxApplication` из IDEA
3. Backend запустится на порту 8080 (не 8082!)

**Важно:** При локальном запуске backend использует настройки из `application.properties`, где указан `localhost:5432` для БД.
