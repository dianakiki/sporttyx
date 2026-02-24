# Stage 1: Build
FROM maven:3.9-eclipse-temurin-11 as build

WORKDIR /app

#COPY settings.xml /root/.m2/settings.xml

COPY backend/pom.xml .
RUN mvn dependency:go-offline -B

COPY backend/src ./src
RUN mvn clean package -DskipTests

# Stage 2: Runtime
FROM eclipse-temurin:11-jre

WORKDIR /app

COPY --from=build /app/target/backend-1.0-SNAPSHOT.jar app.jar

EXPOSE 8080

ENTRYPOINT ["java", "-jar", "app.jar"]
