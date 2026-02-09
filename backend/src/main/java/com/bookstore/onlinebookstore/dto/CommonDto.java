package com.bookstore.onlinebookstore.dto;

import com.fasterxml.jackson.annotation.JsonFormat;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;

import java.time.LocalDateTime;
import java.util.List;

/**
 * Common DTOs used across the application.
 */
public class CommonDto {

    /**
     * Generic success response DTO.
     */
    public static class SuccessResponse {
        private String message;
        
        @JsonFormat(pattern = "yyyy-MM-dd'T'HH:mm:ss")
        private LocalDateTime timestamp;

        // Constructors
        public SuccessResponse() {
            this.timestamp = LocalDateTime.now();
        }

        public SuccessResponse(String message) {
            this.message = message;
            this.timestamp = LocalDateTime.now();
        }

        // Getters and Setters
        public String getMessage() { return message; }
        public void setMessage(String message) { this.message = message; }
        public LocalDateTime getTimestamp() { return timestamp; }
        public void setTimestamp(LocalDateTime timestamp) { this.timestamp = timestamp; }
    }

    /**
     * Generic error response DTO.
     */
    public static class ErrorResponse {
        private String error;
        private String message;
        private String details;
        
        @JsonFormat(pattern = "yyyy-MM-dd'T'HH:mm:ss")
        private LocalDateTime timestamp;
        
        private String path;
        private List<ValidationError> validationErrors;

        // Constructors
        public ErrorResponse() {
            this.timestamp = LocalDateTime.now();
        }

        public ErrorResponse(String error, String message) {
            this.error = error;
            this.message = message;
            this.timestamp = LocalDateTime.now();
        }

        public ErrorResponse(String error, String message, String path) {
            this.error = error;
            this.message = message;
            this.path = path;
            this.timestamp = LocalDateTime.now();
        }

        // Getters and Setters
        public String getError() { return error; }
        public void setError(String error) { this.error = error; }
        public String getMessage() { return message; }
        public void setMessage(String message) { this.message = message; }
        public String getDetails() { return details; }
        public void setDetails(String details) { this.details = details; }
        public LocalDateTime getTimestamp() { return timestamp; }
        public void setTimestamp(LocalDateTime timestamp) { this.timestamp = timestamp; }
        public String getPath() { return path; }
        public void setPath(String path) { this.path = path; }
        public List<ValidationError> getValidationErrors() { return validationErrors; }
        public void setValidationErrors(List<ValidationError> validationErrors) { this.validationErrors = validationErrors; }
    }

    /**
     * Validation error DTO for field-specific errors.
     */
    public static class ValidationError {
        private String field;
        private String message;
        private String rejectedValue;

        // Constructors
        public ValidationError() {}

        public ValidationError(String field, String message, String rejectedValue) {
            this.field = field;
            this.message = message;
            this.rejectedValue = rejectedValue;
        }

        // Getters and Setters
        public String getField() { return field; }
        public void setField(String field) { this.field = field; }
        public String getMessage() { return message; }
        public void setMessage(String message) { this.message = message; }
        public String getRejectedValue() { return rejectedValue; }
        public void setRejectedValue(String rejectedValue) { this.rejectedValue = rejectedValue; }
    }

    /**
     * Health check response DTO.
     */
    public static class HealthResponse {
        private HealthStatus status;
        
        @JsonFormat(pattern = "yyyy-MM-dd'T'HH:mm:ss")
        private LocalDateTime timestamp;
        
        private HealthComponents components;

        // Constructors
        public HealthResponse() {
            this.timestamp = LocalDateTime.now();
        }

        public HealthResponse(HealthStatus status) {
            this.status = status;
            this.timestamp = LocalDateTime.now();
        }

        // Getters and Setters
        public HealthStatus getStatus() { return status; }
        public void setStatus(HealthStatus status) { this.status = status; }
        public LocalDateTime getTimestamp() { return timestamp; }
        public void setTimestamp(LocalDateTime timestamp) { this.timestamp = timestamp; }
        public HealthComponents getComponents() { return components; }
        public void setComponents(HealthComponents components) { this.components = components; }

        /**
         * Health status enumeration.
         */
        public enum HealthStatus {
            UP, DOWN
        }

        /**
         * Health components status.
         */
        public static class HealthComponents {
            private HealthStatus database;
            private HealthStatus redis;

            // Constructors
            public HealthComponents() {}

            // Getters and Setters
            public HealthStatus getDatabase() { return database; }
            public void setDatabase(HealthStatus database) { this.database = database; }
            public HealthStatus getRedis() { return redis; }
            public void setRedis(HealthStatus redis) { this.redis = redis; }
        }
    }

    /**
     * Inventory response DTO.
     */
    public static class InventoryResponse {
        private String bookId;
        private Integer stockQuantity;
        private Integer availableQuantity;
        private Integer reservedQuantity;
        
        @JsonFormat(pattern = "yyyy-MM-dd'T'HH:mm:ss")
        private LocalDateTime lastUpdated;

        // Constructors
        public InventoryResponse() {}

        // Getters and Setters
        public String getBookId() { return bookId; }
        public void setBookId(String bookId) { this.bookId = bookId; }
        public Integer getStockQuantity() { return stockQuantity; }
        public void setStockQuantity(Integer stockQuantity) { this.stockQuantity = stockQuantity; }
        public Integer getAvailableQuantity() { return availableQuantity; }
        public void setAvailableQuantity(Integer availableQuantity) { this.availableQuantity = availableQuantity; }
        public Integer getReservedQuantity() { return reservedQuantity; }
        public void setReservedQuantity(Integer reservedQuantity) { this.reservedQuantity = reservedQuantity; }
        public LocalDateTime getLastUpdated() { return lastUpdated; }
        public void setLastUpdated(LocalDateTime lastUpdated) { this.lastUpdated = lastUpdated; }
    }

    /**
     * Update inventory request DTO.
     */
    public static class UpdateInventoryRequest {
        @NotNull(message = "Stock quantity is required")
        @Min(value = 0, message = "Stock quantity must be non-negative")
        private Integer stockQuantity;

        // Constructors
        public UpdateInventoryRequest() {}

        // Getters and Setters
        public Integer getStockQuantity() { return stockQuantity; }
        public void setStockQuantity(Integer stockQuantity) { this.stockQuantity = stockQuantity; }
    }
}