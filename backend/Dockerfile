# Базовый образ: Eclipse Temurin JRE 11 (Java Runtime Environment)
# Это официальная сборка OpenJDK от Eclipse Foundation
FROM eclipse-temurin:11-jre

# Устанавливаем рабочую директорию внутри контейнера
# Все последующие команды будут выполняться из этой папки
WORKDIR /app

# Копируем собранный JAR файл из папки target в контейнер
# target/backend-1.0-SNAPSHOT.jar -> /app/app.jar
COPY target/backend-1.0-SNAPSHOT.jar app.jar

# Указываем, что контейнер будет слушать порт 8080
# Это информационная директива (не открывает порт автоматически)
EXPOSE 8080

# Команда запуска приложения при старте контейнера
# Запускаем Java приложение из JAR файла
ENTRYPOINT ["java", "-jar", "app.jar"]
