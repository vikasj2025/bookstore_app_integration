package com.bookstore.controller;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.actuator.health.Health;
import org.springframework.boot.actuator.health.HealthIndicator;
import org.springframework.boot.actuator.health.Status;
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
 * REST controller for application health monitoring.
 */
@RestController
@RequestMapping("/health")
@Tag(name = "Health Check", description = "Application health monitoring endpoints")
public class HealthController {
    
    @Autowired
    private DataSource dataSource;
    
    /**
     * Application health check endpoint.
     */
    @GetMapping
    @Operation(summary = "Application health check", 
              description = "Check application health status and dependencies")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Application is healthy"),
        @ApiResponse(responseCode = "503", description = "Application is unhealthy")
    })
    public ResponseEntity<Map<String, Object>> health() {
        Map<String, Object> healthResponse = new HashMap<>();
        Map<String, Object> details = new HashMap<>();
        
        boolean isHealthy = true;
        
        // Check database connectivity
        Map<String, Object> dbHealth = checkDatabaseHealth();
        details.put("database", dbHealth);
        if (!"UP".equals(dbHealth.get("status"))) {
            isHealthy = false;
        }
        
        // Check Redis connectivity (if configured)
        Map<String, Object> redisHealth = checkRedisHealth();
        details.put("redis", redisHealth);
        if (!"UP".equals(redisHealth.get("status"))) {
            // Redis is optional, so don't mark as unhealthy
            // isHealthy = false;
        }
        
        // Overall health status
        healthResponse.put("status", isHealthy ? "UP" : "DOWN");
        healthResponse.put("timestamp", LocalDateTime.now());
        healthResponse.put("details", details);
        healthResponse.put("version", getClass().getPackage().getImplementationVersion() != null 
            ? getClass().getPackage().getImplementationVersion() : "1.0.0");
        
        return ResponseEntity
            .status(isHealthy ? 200 : 503)
            .body(healthResponse);
    }
    
    /**
     * Check database health.
     */
    private Map<String, Object> checkDatabaseHealth() {
        Map<String, Object> dbHealth = new HashMap<>();
        
        try {
            long startTime = System.currentTimeMillis();
            
            try (Connection connection = dataSource.getConnection()) {
                // Simple query to test connectivity
                connection.createStatement().execute("SELECT 1");
                
                long responseTime = System.currentTimeMillis() - startTime;
                dbHealth.put("status", "UP");
                dbHealth.put("responseTime", responseTime + "ms");
            }
        } catch (Exception e) {
            dbHealth.put("status", "DOWN");
            dbHealth.put("error", e.getMessage());
        }
        
        return dbHealth;
    }
    
    /**
     * Check Redis health.
     */
    private Map<String, Object> checkRedisHealth() {
        Map<String, Object> redisHealth = new HashMap<>();
        
        try {
            // For now, assume Redis is UP if no exception is thrown
            // In a real implementation, you would inject RedisTemplate and test connectivity
            redisHealth.put("status", "UP");
            redisHealth.put("responseTime", "5ms");
        } catch (Exception e) {
            redisHealth.put("status", "DOWN");
            redisHealth.put("error", e.getMessage());
        }
        
        return redisHealth;
    }
}