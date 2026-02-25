# Используем Node.js 18 для сборки React приложения
FROM node:18-alpine as build

# Устанавливаем рабочую директорию внутри контейнера
WORKDIR /app

# Копируем файлы с зависимостями
COPY package*.json ./

# Устанавливаем все зависимости проекта
RUN npm install

# Копируем весь исходный код приложения
COPY . .

# Аргумент для API URL (по умолчанию для Docker)
ARG REACT_APP_API_URL=/api
ENV REACT_APP_API_URL=$REACT_APP_API_URL

# Собираем production версию React приложения
# Результат будет в папке /app/build
RUN npm run build

# Используем nginx для раздачи статических файлов
FROM nginx:alpine

# Копируем собранное приложение из предыдущего этапа в nginx
COPY --from=build /app/build /usr/share/nginx/html

# Копируем кастомную конфигурацию nginx для React Router
# (чтобы все роуты перенаправлялись на index.html)
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Открываем порт 80 для HTTP трафика
EXPOSE 80

# Запускаем nginx (команда по умолчанию в образе nginx)
CMD ["nginx", "-g", "daemon off;"]
