# Stage 1: Build
FROM maven:3.9-eclipse-temurin-17 AS build

WORKDIR /app

# Если файла settings.xml нет в этой же папке, закомментируй строку ниже:
# COPY settings.xml /root/.m2/settings.xml

# Берем pom.xml из текущей папки (контекста)
COPY pom.xml .
RUN mvn dependency:go-offline -B

# Берем папку src из текущей папки
COPY src ./src
RUN mvn clean package -DskipTests

# Stage 2: Runtime
FROM eclipse-temurin:17-jre

WORKDIR /app

# Копируем собранный jar из первого этапа
COPY --from=build /app/target/*.jar app.jar

EXPOSE 8080

ENTRYPOINT ["java", "-jar", "app.jar"]