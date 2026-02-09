package com.bookstore.dto.response;

import java.time.LocalDateTime;
import java.util.List;

/**
 * Response DTO for error messages.
 * 
 * This class provides a standardized structure for error responses
 * throughout the Online Bookstore API.
 */
public class ErrorResponse {

    private String error;
    private String message;
    private String details;
    private LocalDateTime timestamp;
    private String path;
    private Integer status;
    private List<ValidationError> validationErrors;

    // Constructors
    public ErrorResponse() {}

    public ErrorResponse(String error, String message, String details, LocalDateTime timestamp, 
                        String path, Integer status, List<ValidationError> validationErrors) {
        this.error = error;
        this.message = message;
        this.details = details;
        this.timestamp = timestamp;
        this.path = path;
        this.status = status;
        this.validationErrors = validationErrors;
    }

    // Builder pattern
    public static ErrorResponseBuilder builder() {
        return new ErrorResponseBuilder();
    }

    // Getters and Setters
    public String getError() {
        return error;
    }

    public void setError(String error) {
        this.error = error;
    }

    public String getMessage() {
        return message;
    }

    public void setMessage(String message) {
        this.message = message;
    }

    public String getDetails() {
        return details;
    }

    public void setDetails(String details) {
        this.details = details;
    }

    public LocalDateTime getTimestamp() {
        return timestamp;
    }

    public void setTimestamp(LocalDateTime timestamp) {
        this.timestamp = timestamp;
    }

    public String getPath() {
        return path;
    }

    public void setPath(String path) {
        this.path = path;
    }

    public Integer getStatus() {
        return status;
    }

    public void setStatus(Integer status) {
        this.status = status;
    }

    public List<ValidationError> getValidationErrors() {
        return validationErrors;
    }

    public void setValidationErrors(List<ValidationError> validationErrors) {
        this.validationErrors = validationErrors;
    }

    @Override
    public String toString() {
        return "ErrorResponse{" +
                "error='" + error + '\'' +
                ", message='" + message + '\'' +
                ", details='" + details + '\'' +
                ", timestamp=" + timestamp +
                ", path='" + path + '\'' +
                ", status=" + status +
                ", validationErrors=" + validationErrors +
                '}';
    }

    /**
     * Validation error details.
     */
    public static class ValidationError {
        private String field;
        private String message;
        private String rejectedValue;

        public ValidationError() {}

        public ValidationError(String field, String message, String rejectedValue) {
            this.field = field;
            this.message = message;
            this.rejectedValue = rejectedValue;
        }

        // Getters and Setters
        public String getField() {
            return field;
        }

        public void setField(String field) {
            this.field = field;
        }

        public String getMessage() {
            return message;
        }

        public void setMessage(String message) {
            this.message = message;
        }

        public String getRejectedValue() {
            return rejectedValue;
        }

        public void setRejectedValue(String rejectedValue) {
            this.rejectedValue = rejectedValue;
        }

        @Override
        public String toString() {
            return "ValidationError{" +
                    "field='" + field + '\'' +
                    ", message='" + message + '\'' +
                    ", rejectedValue='" + rejectedValue + '\'' +
                    '}';
        }
    }

    /**
     * Builder class for ErrorResponse.
     */
    public static class ErrorResponseBuilder {
        private String error;
        private String message;
        private String details;
        private LocalDateTime timestamp;
        private String path;
        private Integer status;
        private List<ValidationError> validationErrors;

        public ErrorResponseBuilder error(String error) {
            this.error = error;
            return this;
        }

        public ErrorResponseBuilder message(String message) {
            this.message = message;
            return this;
        }

        public ErrorResponseBuilder details(String details) {
            this.details = details;
            return this;
        }

        public ErrorResponseBuilder timestamp(LocalDateTime timestamp) {
            this.timestamp = timestamp;
            return this;
        }

        public ErrorResponseBuilder path(String path) {
            this.path = path;
            return this;
        }

        public ErrorResponseBuilder status(Integer status) {
            this.status = status;
            return this;
        }

        public ErrorResponseBuilder validationErrors(List<ValidationError> validationErrors) {
            this.validationErrors = validationErrors;
            return this;
        }

        public ErrorResponse build() {
            return new ErrorResponse(error, message, details, timestamp, path, status, validationErrors);
        }
    }
}