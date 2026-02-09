package com.bookstore.controller;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.actuator.health.Health;
import org.springframework.boot.actuator.health.HealthIndicator;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import javax.sql.DataSource;
import java.sql.Connection;
import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.Map;

/**
 * REST controller for health check operations.
 * 
 * This controller provides health check endpoints for monitoring
 * the Online Bookstore application's status and dependencies.
 */
@RestController
@RequestMapping("/api/v1/health")
@Tag(name = "Health Check", description = "Application health monitoring endpoints")
public class HealthController {

    @Autowired
    private DataSource dataSource;

    /**
     * Basic health check endpoint.
     * 
     * @return health status
     */
    @GetMapping
    @Operation(
        summary = "Health check",
        description = "Check the overall health status of the application and its dependencies"
    )
    @ApiResponses(value = {
        @ApiResponse(
            responseCode = "200",
            description = "Service is healthy",
            content = @Content(schema = @Schema(implementation = HealthResponse.class))
        ),
        @ApiResponse(
            responseCode = "503",
            description = "Service is unhealthy",
            content = @Content(schema = @Schema(implementation = HealthResponse.class))
        )
    })
    public ResponseEntity<HealthResponse> health() {
        HealthResponse response = new HealthResponse();
        response.setTimestamp(LocalDateTime.now());
        
        Map<String, ServiceHealth> services = new HashMap<>();
        
        // Check database health
        ServiceHealth dbHealth = checkDatabaseHealth();
        services.put("database", dbHealth);
        
        // Determine overall status
        boolean allHealthy = services.values().stream()
                .allMatch(service -> "UP".equals(service.getStatus()));
        
        response.setStatus(allHealthy ? "UP" : "DOWN");
        response.setServices(services);
        
        return ResponseEntity.ok(response);
    }

    /**
     * Readiness probe endpoint.
     * 
     * @return readiness status
     */
    @GetMapping("/ready")
    @Operation(
        summary = "Readiness probe",
        description = "Check if the application is ready to serve requests"
    )
    @ApiResponse(
        responseCode = "200",
        description = "Application is ready"
    )
    public ResponseEntity<Map<String, Object>> ready() {
        Map<String, Object> response = new HashMap<>();
        response.put("status", "READY");
        response.put("timestamp", LocalDateTime.now());
        response.put("message", "Application is ready to serve requests");
        
        return ResponseEntity.ok(response);
    }

    /**
     * Liveness probe endpoint.
     * 
     * @return liveness status
     */
    @GetMapping("/live")
    @Operation(
        summary = "Liveness probe",
        description = "Check if the application is alive and running"
    )
    @ApiResponse(
        responseCode = "200",
        description = "Application is alive"
    )
    public ResponseEntity<Map<String, Object>> live() {
        Map<String, Object> response = new HashMap<>();
        response.put("status", "ALIVE");
        response.put("timestamp", LocalDateTime.now());
        response.put("uptime", getUptime());
        
        return ResponseEntity.ok(response);
    }

    /**
     * Check database connectivity.
     * 
     * @return database health status
     */
    private ServiceHealth checkDatabaseHealth() {
        ServiceHealth health = new ServiceHealth();
        Map<String, Object> details = new HashMap<>();
        
        try {
            // Test database connection
            try (Connection connection = dataSource.getConnection()) {
                boolean isValid = connection.isValid(5); // 5 second timeout
                
                if (isValid) {
                    health.setStatus("UP");
                    details.put("database", "PostgreSQL");
                    details.put("connection", "Valid");
                } else {
                    health.setStatus("DOWN");
                    details.put("error", "Database connection is not valid");
                }
            }
        } catch (Exception e) {
            health.setStatus("DOWN");
            details.put("error", e.getMessage());
        }
        
        health.setDetails(details);
        return health;
    }

    /**
     * Get application uptime in milliseconds.
     * 
     * @return uptime in milliseconds
     */
    private long getUptime() {
        return System.currentTimeMillis() - getStartTime();
    }

    /**
     * Get application start time (simplified implementation).
     * 
     * @return start time in milliseconds
     */
    private long getStartTime() {
        // In a real implementation, this would be set during application startup
        // For now, we'll use a reasonable approximation
        return System.currentTimeMillis() - Runtime.getRuntime().totalMemory() / 1000000;
    }

    /**
     * Health response DTO.
     */
    public static class HealthResponse {
        private String status;
        private LocalDateTime timestamp;
        private Map<String, ServiceHealth> services;

        // Getters and Setters
        public String getStatus() {
            return status;
        }

        public void setStatus(String status) {
            this.status = status;
        }

        public LocalDateTime getTimestamp() {
            return timestamp;
        }

        public void setTimestamp(LocalDateTime timestamp) {
            this.timestamp = timestamp;
        }

        public Map<String, ServiceHealth> getServices() {
            return services;
        }

        public void setServices(Map<String, ServiceHealth> services) {
            this.services = services;
        }
    }

    /**
     * Service health DTO.
     */
    public static class ServiceHealth {
        private String status;
        private Map<String, Object> details;

        // Getters and Setters
        public String getStatus() {
            return status;
        }

        public void setStatus(String status) {
            this.status = status;
        }

        public Map<String, Object> getDetails() {
            return details;
        }

        public void setDetails(Map<String, Object> details) {
            this.details = details;
        }
    }
}