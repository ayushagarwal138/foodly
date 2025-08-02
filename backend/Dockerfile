# Backend Dockerfile
FROM openjdk:21-jdk-slim

# Set working directory
WORKDIR /app

# Copy Maven wrapper and pom.xml
COPY mvnw .
COPY .mvn .mvn
COPY pom.xml .

# Make mvnw executable
RUN chmod +x mvnw

# Download dependencies
RUN ./mvnw dependency:go-offline -B

# Copy source code
COPY src src

# Build the application
RUN ./mvnw clean package -DskipTests

# Create a new stage for runtime
FROM openjdk:21-slim

# Set working directory
WORKDIR /app

# Copy the built jar from the build stage
COPY --from=0 /app/target/*.jar app.jar

# Expose port
EXPOSE 8080

# Set environment variables
ENV SPRING_PROFILES_ACTIVE=production

# Run the application
ENTRYPOINT ["java", "-jar", "app.jar"] 