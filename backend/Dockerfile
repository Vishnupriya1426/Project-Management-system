# Stage 1: Build JAR with Maven & OpenJDK 21
FROM maven:3.9.6-eclipse-temurin-21 AS builder
WORKDIR /app
COPY pom.xml .
RUN mvn dependency:go-offline -B
COPY src ./src
RUN mvn package -DskipTests

# Stage 2: Runtime Container
FROM eclipse-temurin:21-jre-alpine
WORKDIR /app
RUN addgroup -S spemsgroup && adduser -S spemsuser -G spemsgroup
COPY --from=builder /app/target/spems-backend-*.jar app.jar
RUN mkdir -p /app/uploads && chown -R spemsuser:spemsgroup /app
USER spemsuser
EXPOSE 8080
ENTRYPOINT ["java", "-jar", "-Dspring.profiles.active=${SPRING_PROFILES_ACTIVE:prod}", "app.jar"]
