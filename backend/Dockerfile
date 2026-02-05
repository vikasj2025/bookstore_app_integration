# Multi-stage Docker build for Maven Wrapper Bootstrap API

# Stage 1: Build stage
FROM maven:3.9.5-eclipse-temurin-17 AS builder

# Set working directory
WORKDIR /app

# Copy Maven configuration files
COPY pom.xml .
COPY .mvn/ .mvn/
COPY mvnw .
COPY mvnw.cmd .

# Download dependencies (this layer will be cached if pom.xml doesn't change)
RUN mvn dependency:go-offline -B

# Copy source code
COPY src/ src/

# Build the application
RUN mvn clean package -DskipTests -B

# Stage 2: Runtime stage
FROM eclipse-temurin:17-jre-alpine AS runtime

# Install curl for health checks
RUN apk add --no-cache curl

# Create non-root user
RUN addgroup -g 1001 -S appgroup && \
    adduser -u 1001 -S appuser -G appgroup

# Set working directory
WORKDIR /app

# Create directories
RUN mkdir -p /app/logs /app/downloads && \
    chown -R appuser:appgroup /app

# Copy JAR from builder stage
COPY --from=builder /app/target/maven-wrapper-bootstrap-api-*.jar app.jar

# Change ownership of the JAR file
RUN chown appuser:appgroup app.jar

# Switch to non-root user
USER appuser

# Expose port
EXPOSE 8080

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=60s --retries=3 \
    CMD curl -f http://localhost:8080/v1/actuator/health || exit 1

# JVM options for containerized environment
ENV JAVA_OPTS="-XX:+UseContainerSupport -XX:MaxRAMPercentage=75.0 -XX:+UseG1GC -XX:+UseStringDeduplication -Djava.security.egd=file:/dev/./urandom"

# Set default profile
ENV SPRING_PROFILES_ACTIVE=prod

# Entry point
ENTRYPOINT ["sh", "-c", "java $JAVA_OPTS -jar app.jar"]

# Labels for metadata
LABEL maintainer="Maven Bootstrap API Team <support@mavenbootstrap.com>" \
      version="1.0.0" \
      description="Maven Wrapper Bootstrap API for automated Maven setup" \
      org.opencontainers.image.title="Maven Wrapper Bootstrap API" \
      org.opencontainers.image.description="API for Zero-Setup Maven Builds Across Environments" \
      org.opencontainers.image.version="1.0.0" \
      org.opencontainers.image.vendor="Maven Bootstrap" \
      org.opencontainers.image.licenses="MIT" \
      org.opencontainers.image.source="https://github.com/maven-bootstrap/api"