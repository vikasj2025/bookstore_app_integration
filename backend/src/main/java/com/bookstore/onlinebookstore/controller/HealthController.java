package com.bookstore.onlinebookstore.controller;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.actuator.health.Health;
import org.springframework.boot.actuator.health.HealthIndicator;
import org.springframework.data.redis.connection.RedisConnection;
import org.springframework.data.redis.core.RedisTemplate;
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
 * REST Controller for health check operations
 */
@RestController
@RequestMapping("/health")
@Tag(name = "Health Check", description = "Application health monitoring")
public class HealthController {
    
    @Autowired
    private DataSource dataSource;
    
    @Autowired
    private RedisTemplate<String, Object> redisTemplate;
    
    /**
     * Application health check
     */
    @GetMapping
    @Operation(summary = "Application health check", description = "Check the health status of the application")
    public ResponseEntity<Map<String, Object>> health() {
        Map<String, Object> healthStatus = new HashMap<>();
        Map<String, String> components = new HashMap<>();
        
        // Check database health
        boolean dbHealthy = checkDatabaseHealth();
        components.put("database", dbHealthy ? "UP" : "DOWN");
        
        // Check Redis health
        boolean redisHealthy = checkRedisHealth();
        components.put("redis", redisHealthy ? "UP" : "DOWN");
        
        // Overall status
        String overallStatus = (dbHealthy && redisHealthy) ? "UP" : "DOWN";
        
        healthStatus.put("status", overallStatus);
        healthStatus.put("timestamp", LocalDateTime.now());
        healthStatus.put("components", components);
        
        return ResponseEntity.ok(healthStatus);
    }
    
    /**
     * Check database connectivity
     */
    private boolean checkDatabaseHealth() {
        try (Connection connection = dataSource.getConnection()) {
            return connection.isValid(5); // 5 second timeout
        } catch (Exception e) {
            return false;
        }
    }
    
    /**
     * Check Redis connectivity
     */
    private boolean checkRedisHealth() {
        try {
            RedisConnection connection = redisTemplate.getConnectionFactory().getConnection();
            String pong = connection.ping();
            connection.close();
            return "PONG".equals(pong);
        } catch (Exception e) {
            return false;
        }
    }
}
