# Настройка CI/CD для DiaSporttyx

## 🚀 Автоматическое развертывание при коммите

Создан GitHub Actions workflow, который автоматически:
- Тестирует код
- Собирает frontend и backend
- Развертывает на выбранные платформы
- Уведомляет о результатах

---

## 📋 Настройка

### 1. Создайте Secrets в GitHub

Перейдите в Settings → Secrets and variables → Actions и добавьте:

#### Для VPS развертывания:
```
HOST=your-server-ip
USERNAME=your-ssh-username
SSH_KEY=-----BEGIN OPENSSH PRIVATE KEY-----
your-ssh-private-key-content
-----END OPENSSH PRIVATE KEY-----
API_URL=http://your-server-ip:8080
```

#### Для Heroku:
```
HEROKU_API_KEY=your-heroku-api-key
HEROKU_APP_NAME=your-heroku-app-name
```

#### Для уведомлений (опционально):
```
SLACK_WEBHOOK=your-slack-webhook-url
```

#### Для staging сервера (опционально):
```
STAGING_HOST=staging-server-ip
STAGING_USERNAME=staging-ssh-username
STAGING_SSH_KEY=staging-ssh-key
```

### 2. Генерация SSH ключа

Если у вас еще нет SSH ключа для сервера:

```bash
# Создайте ключ
ssh-keygen -t rsa -b 4096 -C "github-actions" -f ~/.ssh/github_actions_key

# Добавьте ключ на сервер
ssh-copy-id -i ~/.ssh/github_actions_key.pub user@your-server-ip

# Получите приватный ключ для GitHub
cat ~/.ssh/github_actions_key
```

Скопируйте содержимое приватного ключа и добавьте в `SSH_KEY` secret.

---

## 🔄 Как работает CI/CD

### Триггеры:
- **Push в main/develop ветки** → Полное развертывание
- **Pull Request** → Тесты и развертывание на staging

### Jobs:

#### 1. **Backend Job**
- Устанавливает JDK 11
- Кеширует Maven зависимости
- Запускает тесты с PostgreSQL
- Собирает JAR файл
- Загружает artifact

#### 2. **Frontend Job**
- Устанавливает Node.js 18
- Кеширует npm зависимости
- Запускает тесты
- Собирает build для production
- Загружает artifact

#### 3. **Deploy Jobs** (выполняются в зависимости от условий):

**deploy-production** (только для main ветки):
- Скачивает artifacts
- Развертывает на VPS через SSH
- Проверяет здоровье сервисов

**deploy-staging** (только для Pull Request):
- Развертывает на staging сервер

**deploy-github-pages** (только для main ветки):
- Развертывает frontend на GitHub Pages

**deploy-heroku** (альтернативный вариант):
- Развертывает backend на Heroku

#### 4. **Security Scan**
- Сканирует код на уязвимости
- Загружает результаты в Security tab

#### 5. **Notify**
- Отправляет уведомления в Slack

---

## 🛠️ Конфигурация для разных платформ

### Вариант 1: VPS (Рекомендуется)

**Преимущества:**
- Полный контроль
- Все в одном месте
- Бесплатно (кроме VPS)

**Настройка:**
1. Настройте SSH ключи
2. Добавьте secrets в GitHub
3. Настройте docker-compose на сервере
4. Workflow автоматически развернет при коммите

### Вариант 2: GitHub Pages + Heroku

**Преимущества:**
- Frontend бесплатно
- Backend с базой данных
- Простая настройка

**Настройка:**
1. Создайте Heroku приложение
2. Добавьте Heroku API key в secrets
3. Настройте CORS для GitHub Pages URL
4. Workflow развернет frontend на Pages, backend на Heroku

### Вариант 3: GitHub Pages + VPS

**Преимущества:**
- Frontend бесплатно
- Backend на своем сервере
- Гибкость

**Настройка:**
1. Разверните только backend на VPS
2. Настройте CORS для GitHub Pages
3. Workflow развернет frontend на Pages

---

## 📝 Примеры workflow

### Автоматическое развертывание на main:

```bash
git checkout main
git add .
git commit -m "Add new feature"
git push origin main
```

**Что произойдет:**
1. ✅ Запустятся тесты
2. ✅ Соберется frontend и backend
3. ✅ Развернется на production
4. ✅ Отправится уведомление

### Тестирование в Pull Request:

```bash
git checkout -b feature/new-feature
# ... делаете изменения ...
git push origin feature/new-feature
# Создаете Pull Request
```

**Что произойдет:**
1. ✅ Запустятся тесты
2. ✅ Соберется frontend и backend
3. ✅ Развернется на staging
4. ✅ Будет доступен для проверки

---

## 🔧 Настройка docker-compose для CI/CD

Создайте `docker-compose.prod.yml` на сервере:

```yaml
version: '3.8'

services:
  frontend:
    image: nginx:alpine
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./nginx/html:/usr/share/nginx/html
      - ./nginx/conf.d:/etc/nginx/conf.d
    depends_on:
      - backend

  backend:
    image: openjdk:11-jre
    ports:
      - "8080:8080"
    volumes:
      - ./backend/target/backend-1.0-SNAPSHOT.jar:/app.jar
    environment:
      - SPRING_PROFILES_ACTIVE=prod
      - SPRING_DATASOURCE_URL=jdbc:postgresql://postgres:5432/sporttyx_db
      - SPRING_DATASOURCE_USERNAME=postgres
      - SPRING_DATASOURCE_PASSWORD=${POSTGRES_PASSWORD}
    depends_on:
      - postgres
    command: ["java", "-jar", "/app.jar"]

  postgres:
    image: postgres:15
    environment:
      - POSTGRES_DB=sporttyx_db
      - POSTGRES_USER=postgres
      - POSTGRES_PASSWORD=${POSTGRES_PASSWORD}
    volumes:
      - postgres_data:/var/lib/postgresql/data
    ports:
      - "5432:5432"

volumes:
  postgres_data:
```

Создайте `.env` файл на сервере:
```env
POSTGRES_PASSWORD=your_secure_password
```

---

## 🐛 Troubleshooting

### Проблема: SSH ошибка
**Решение:** Проверьте SSH ключ и права доступа:
```bash
chmod 600 ~/.ssh/github_actions_key
```

### Проблема: Тесты не проходят
**Решение:** Проверьте переменные окружения в workflow

### Проблема: Frontend не собирается
**Решение:** Проверьте `REACT_APP_API_URL` в secrets

### Проблема: Backend не запускается
**Решение:** Проверьте логи на сервере:
```bash
docker-compose logs backend
```

### Проблема: CORS ошибки
**Решение:** Добавьте URL frontend в `SecurityConfig.java`

---

## 📊 Мониторинг

### Просмотр результатов:
1. **GitHub Actions:** Actions tab в репозитории
2. **Логи развертывания:** В деталях каждого job
3. **Статус сервисов:** В логах docker-compose

### Уведомления:
- **GitHub:** Автоматические уведомления
- **Slack:** Если настроен webhook
- **Email:** Можно добавить в workflow

---

## 🔄 Rollback

Если что-то пошло не так:

### Быстрый rollback:
```bash
# На сервере
git checkout previous-commit-tag
docker-compose up -d --build
```

### Через GitHub:
1. Откатите коммит: `git revert HEAD`
2. Push: `git push origin main`
3. CI/CD автоматически развернет предыдущую версию

---

## 💡 Советы

1. **Тестируйте на staging** перед production
2. **Используйте ветки** для разработки
3. **Следите за логами** развертывания
4. **Регулярно обновляйте** зависимости
5. **Бэкапьте базу данных** перед major обновлениями

---

## 📚 Дополнительные ресурсы

- [GitHub Actions Documentation](https://docs.github.com/en/actions)
- [Docker Compose Reference](https://docs.docker.com/compose/)
- [Nginx Configuration](https://nginx.org/en/docs/)
- [Spring Boot Production](https://spring.io/guides/gs/spring-boot-for-production/)
