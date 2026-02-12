# Инструкция по развертыванию DiaSporttyx

## ⚠️ Важное замечание о GitHub Pages

**GitHub Pages предназначен только для статических сайтов** и не поддерживает backend приложения с базой данных. 

Для полноценного развертывания DiaSporttyx вам нужно:
- **Frontend** → GitHub Pages (или Netlify, Vercel)
- **Backend + Database** → VPS сервер (DigitalOcean, AWS, Heroku и т.д.)

---

## Вариант 1: Полное развертывание на VPS (Рекомендуется)

### Требования:
- VPS сервер (Ubuntu 20.04+)
- Docker и Docker Compose установлены
- Доменное имя (опционально)

### Шаги:

1. **Подключитесь к серверу:**
```bash
ssh user@your-server-ip
```

2. **Установите Docker и Docker Compose (если не установлены):**
```bash
# Установка Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh

# Установка Docker Compose
sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose
```

3. **Клонируйте репозиторий:**
```bash
git clone https://github.com/your-username/sporttyx.git
cd sporttyx
```

4. **Настройте переменные окружения:**
```bash
# Создайте .env файл
nano .env
```

Добавьте:
```env
# Database
POSTGRES_DB=sporttyx_db
POSTGRES_USER=postgres
POSTGRES_PASSWORD=your_secure_password

# Backend
JWT_SECRET=your_jwt_secret_key_here
SPRING_DATASOURCE_URL=jdbc:postgresql://postgres:5432/sporttyx_db
SPRING_DATASOURCE_USERNAME=postgres
SPRING_DATASOURCE_PASSWORD=your_secure_password

# Frontend
REACT_APP_API_URL=http://your-server-ip:8080
```

5. **Обновите docker-compose.yml для production:**
```yaml
# Измените порты на внешние
services:
  frontend:
    ports:
      - "80:80"  # HTTP
      - "443:443"  # HTTPS (если настроен SSL)
  
  backend:
    ports:
      - "8080:8080"
    environment:
      - SPRING_PROFILES_ACTIVE=prod
```

6. **Пересоберите backend с production настройками:**
```bash
cd backend
mvn clean package -DskipTests
cd ..
```

7. **Запустите приложение:**
```bash
docker-compose up -d --build
```

8. **Проверьте статус:**
```bash
docker-compose ps
docker-compose logs -f
```

9. **Настройте Nginx (опционально, для домена):**
```bash
sudo apt install nginx
sudo nano /etc/nginx/sites-available/diasporttyx
```

Конфигурация Nginx:
```nginx
server {
    listen 80;
    server_name your-domain.com;

    location / {
        proxy_pass http://localhost:80;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }

    location /api {
        proxy_pass http://localhost:8080;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
}
```

```bash
sudo ln -s /etc/nginx/sites-available/diasporttyx /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
```

10. **Настройте SSL с Let's Encrypt (опционально):**
```bash
sudo apt install certbot python3-certbot-nginx
sudo certbot --nginx -d your-domain.com
```

---

## Вариант 2: Frontend на GitHub Pages + Backend на VPS

### Часть 1: Развертывание Backend на VPS

Следуйте шагам 1-8 из Варианта 1, но только для backend.

### Часть 2: Развертывание Frontend на GitHub Pages

1. **Обновите конфигурацию frontend:**

Создайте файл `.env.production` в папке `frontend`:
```env
REACT_APP_API_URL=http://your-server-ip:8080
```

2. **Обновите package.json:**
```json
{
  "homepage": "https://your-username.github.io/sporttyx",
  "scripts": {
    "predeploy": "npm run build",
    "deploy": "gh-pages -d build"
  }
}
```

3. **Установите gh-pages:**
```bash
cd frontend
npm install --save-dev gh-pages
```

4. **Обновите настройки CORS в backend:**

В `SecurityConfig.java`:
```java
configuration.setAllowedOrigins(Arrays.asList(
    "http://localhost:3000",
    "https://your-username.github.io"
));
```

5. **Пересоберите и задеплойте backend:**
```bash
cd backend
mvn clean package -DskipTests
# Загрузите новый JAR на сервер и перезапустите
```

6. **Задеплойте frontend на GitHub Pages:**
```bash
cd frontend
npm run deploy
```

7. **Настройте GitHub Pages:**
- Перейдите в Settings → Pages
- Source: Deploy from a branch
- Branch: gh-pages / root
- Сохраните

8. **Доступ к приложению:**
```
https://your-username.github.io/sporttyx
```

---

## Вариант 3: Heroku (Простой вариант)

### Backend на Heroku:

1. **Создайте приложение:**
```bash
heroku create diasporttyx-backend
heroku addons:create heroku-postgresql:hobby-dev
```

2. **Настройте переменные окружения:**
```bash
heroku config:set JWT_SECRET=your_secret_key
heroku config:set SPRING_PROFILES_ACTIVE=prod
```

3. **Создайте Procfile:**
```
web: java -jar target/backend-1.0-SNAPSHOT.jar --server.port=$PORT
```

4. **Деплой:**
```bash
git subtree push --prefix backend heroku main
```

### Frontend на Netlify:

1. **Подключите GitHub репозиторий к Netlify**
2. **Настройте build:**
   - Base directory: `frontend`
   - Build command: `npm run build`
   - Publish directory: `frontend/build`
3. **Добавьте переменные окружения:**
   - `REACT_APP_API_URL`: URL вашего Heroku backend

---

## Проверка работоспособности

После развертывания проверьте:

1. **Frontend доступен:** Откройте URL в браузере
2. **Backend работает:** `curl http://your-backend-url/api/teams/rankings`
3. **База данных подключена:** Попробуйте зарегистрироваться
4. **Админ создан:** Войдите как `admin` / `admin_123`

---

## Обновление приложения

### На VPS:
```bash
cd sporttyx
git pull
cd backend && mvn clean package -DskipTests && cd ..
docker-compose up -d --build
```

### На GitHub Pages:
```bash
cd frontend
npm run deploy
```

---

## Troubleshooting

### Проблема: CORS ошибки
**Решение:** Убедитесь, что URL frontend добавлен в `SecurityConfig.java`

### Проблема: 404 на API запросах
**Решение:** Проверьте, что backend запущен и доступен

### Проблема: База данных не подключается
**Решение:** Проверьте переменные окружения и доступность PostgreSQL

### Проблема: Frontend не может подключиться к backend
**Решение:** Проверьте `REACT_APP_API_URL` в `.env.production`

---

## Рекомендации по безопасности

1. **Измените пароли по умолчанию:**
   - PostgreSQL пароль
   - JWT secret
   - Админ пароль (через UI после первого входа)

2. **Настройте firewall:**
```bash
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp
sudo ufw allow 22/tcp
sudo ufw enable
```

3. **Регулярно обновляйте зависимости:**
```bash
cd frontend && npm audit fix
cd backend && mvn versions:display-dependency-updates
```

4. **Настройте автоматические бэкапы базы данных**

---

## Контакты и поддержка

Для вопросов и проблем создавайте Issues в GitHub репозитории.
