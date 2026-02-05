package com.mavenbootstrap.exception;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.slf4j.MDC;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.FieldError;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import org.springframework.web.context.request.WebRequest;

import java.time.Instant;
import java.util.HashMap;
import java.util.Map;

/**
 * Global exception handler for the application.
 */
@RestControllerAdvice
public class GlobalExceptionHandler {

    private static final Logger logger = LoggerFactory.getLogger(GlobalExceptionHandler.class);

    /**
     * Handle bootstrap not found exceptions.
     */
    @ExceptionHandler(BootstrapNotFoundException.class)
    public ResponseEntity<Map<String, Object>> handleBootstrapNotFoundException(
            BootstrapNotFoundException ex, WebRequest request) {
        
        logger.warn("Bootstrap not found: {}", ex.getMessage());
        return createErrorResponse(HttpStatus.NOT_FOUND, "BOOTSTRAP_NOT_FOUND", 
                                 ex.getMessage(), "The requested bootstrap operation was not found");
    }

    /**
     * Handle bootstrap processing exceptions.
     */
    @ExceptionHandler(BootstrapProcessingException.class)
    public ResponseEntity<Map<String, Object>> handleBootstrapProcessingException(
            BootstrapProcessingException ex, WebRequest request) {
        
        logger.error("Bootstrap processing error: {}", ex.getMessage(), ex);
        return createErrorResponse(HttpStatus.INTERNAL_SERVER_ERROR, "BOOTSTRAP_PROCESSING_ERROR", 
                                 ex.getMessage(), "An error occurred while processing the bootstrap operation");
    }

    /**
     * Handle download exceptions.
     */
    @ExceptionHandler(DownloadException.class)
    public ResponseEntity<Map<String, Object>> handleDownloadException(
            DownloadException ex, WebRequest request) {
        
        logger.error("Download error: {}", ex.getMessage(), ex);
        return createErrorResponse(HttpStatus.INTERNAL_SERVER_ERROR, "DOWNLOAD_ERROR", 
                                 ex.getMessage(), "An error occurred during the download process");
    }

    /**
     * Handle verification exceptions.
     */
    @ExceptionHandler(VerificationException.class)
    public ResponseEntity<Map<String, Object>> handleVerificationException(
            VerificationException ex, WebRequest request) {
        
        logger.error("Verification error: {}", ex.getMessage(), ex);
        return createErrorResponse(HttpStatus.BAD_REQUEST, "VERIFICATION_ERROR", 
                                 ex.getMessage(), "File verification failed");
    }

    /**
     * Handle validation exceptions.
     */
    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<Map<String, Object>> handleValidationException(
            MethodArgumentNotValidException ex, WebRequest request) {
        
        logger.warn("Validation error: {}", ex.getMessage());
        
        Map<String, String> validationErrors = new HashMap<>();
        ex.getBindingResult().getAllErrors().forEach(error -> {
            String fieldName = ((FieldError) error).getField();
            String errorMessage = error.getDefaultMessage();
            validationErrors.put(fieldName, errorMessage);
        });
        
        return createValidationErrorResponse(validationErrors);
    }

    /**
     * Handle illegal argument exceptions.
     */
    @ExceptionHandler(IllegalArgumentException.class)
    public ResponseEntity<Map<String, Object>> handleIllegalArgumentException(
            IllegalArgumentException ex, WebRequest request) {
        
        logger.warn("Invalid argument: {}", ex.getMessage());
        return createErrorResponse(HttpStatus.BAD_REQUEST, "INVALID_ARGUMENT", 
                                 ex.getMessage(), "Invalid request parameters");
    }

    /**
     * Handle illegal state exceptions.
     */
    @ExceptionHandler(IllegalStateException.class)
    public ResponseEntity<Map<String, Object>> handleIllegalStateException(
            IllegalStateException ex, WebRequest request) {
        
        logger.warn("Invalid state: {}", ex.getMessage());
        return createErrorResponse(HttpStatus.CONFLICT, "INVALID_STATE", 
                                 ex.getMessage(), "The operation cannot be performed in the current state");
    }

    /**
     * Handle cache exceptions.
     */
    @ExceptionHandler(CacheException.class)
    public ResponseEntity<Map<String, Object>> handleCacheException(
            CacheException ex, WebRequest request) {
        
        logger.error("Cache error: {}", ex.getMessage(), ex);
        return createErrorResponse(HttpStatus.INTERNAL_SERVER_ERROR, "CACHE_ERROR", 
                                 ex.getMessage(), "An error occurred with the caching system");
    }

    /**
     * Handle generic exceptions.
     */
    @ExceptionHandler(Exception.class)
    public ResponseEntity<Map<String, Object>> handleGenericException(
            Exception ex, WebRequest request) {
        
        logger.error("Unexpected error: {}", ex.getMessage(), ex);
        return createErrorResponse(HttpStatus.INTERNAL_SERVER_ERROR, "INTERNAL_SERVER_ERROR", 
                                 "An unexpected error occurred", "Please try again later or contact support");
    }

    /**
     * Create standard error response.
     */
    private ResponseEntity<Map<String, Object>> createErrorResponse(HttpStatus status, 
                                                                   String code, 
                                                                   String message, 
                                                                   String details) {
        Map<String, Object> errorResponse = new HashMap<>();
        Map<String, Object> error = new HashMap<>();
        
        error.put("code", code);
        error.put("message", message);
        error.put("details", details);
        error.put("timestamp", Instant.now().toString());
        error.put("traceId", MDC.get("traceId"));
        
        errorResponse.put("error", error);
        
        return new ResponseEntity<>(errorResponse, status);
    }

    /**
     * Create validation error response.
     */
    private ResponseEntity<Map<String, Object>> createValidationErrorResponse(Map<String, String> validationErrors) {
        Map<String, Object> errorResponse = new HashMap<>();
        Map<String, Object> error = new HashMap<>();
        
        error.put("code", "VALIDATION_ERROR");
        error.put("message", "Request validation failed");
        error.put("details", "Please check the request parameters and try again");
        error.put("timestamp", Instant.now().toString());
        error.put("traceId", MDC.get("traceId"));
        error.put("validationErrors", validationErrors);
        
        errorResponse.put("error", error);
        
        return new ResponseEntity<>(errorResponse, HttpStatus.BAD_REQUEST);
    }
}