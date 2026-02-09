package com.bookstore.exception;

import com.bookstore.dto.response.ErrorResponse;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.core.AuthenticationException;
import org.springframework.validation.FieldError;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import org.springframework.web.context.request.WebRequest;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

/**
 * Global exception handler for the Online Bookstore application.
 * 
 * This class handles exceptions thrown throughout the application and
 * converts them into appropriate HTTP responses with structured error messages.
 */
@RestControllerAdvice
public class GlobalExceptionHandler {

    private static final Logger logger = LoggerFactory.getLogger(GlobalExceptionHandler.class);

    /**
     * Handle ResourceNotFoundException.
     * 
     * @param ex the exception
     * @param request the web request
     * @return error response with 404 status
     */
    @ExceptionHandler(ResourceNotFoundException.class)
    public ResponseEntity<ErrorResponse> handleResourceNotFoundException(
            ResourceNotFoundException ex, WebRequest request) {
        
        logger.warn("Resource not found: {}", ex.getMessage());
        
        ErrorResponse errorResponse = ErrorResponse.builder()
                .error("Resource Not Found")
                .message(ex.getMessage())
                .timestamp(LocalDateTime.now())
                .path(getPath(request))
                .status(HttpStatus.NOT_FOUND.value())
                .build();
        
        return new ResponseEntity<>(errorResponse, HttpStatus.NOT_FOUND);
    }

    /**
     * Handle UserAlreadyExistsException.
     * 
     * @param ex the exception
     * @param request the web request
     * @return error response with 409 status
     */
    @ExceptionHandler(UserAlreadyExistsException.class)
    public ResponseEntity<ErrorResponse> handleUserAlreadyExistsException(
            UserAlreadyExistsException ex, WebRequest request) {
        
        logger.warn("User already exists: {}", ex.getMessage());
        
        ErrorResponse errorResponse = ErrorResponse.builder()
                .error("User Already Exists")
                .message(ex.getMessage())
                .timestamp(LocalDateTime.now())
                .path(getPath(request))
                .status(HttpStatus.CONFLICT.value())
                .build();
        
        return new ResponseEntity<>(errorResponse, HttpStatus.CONFLICT);
    }

    /**
     * Handle validation errors from @Valid annotations.
     * 
     * @param ex the exception
     * @param request the web request
     * @return error response with 400 status and validation details
     */
    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<ErrorResponse> handleValidationException(
            MethodArgumentNotValidException ex, WebRequest request) {
        
        logger.warn("Validation failed: {}", ex.getMessage());
        
        List<ErrorResponse.ValidationError> validationErrors = new ArrayList<>();
        ex.getBindingResult().getAllErrors().forEach(error -> {
            String fieldName = ((FieldError) error).getField();
            String errorMessage = error.getDefaultMessage();
            Object rejectedValue = ((FieldError) error).getRejectedValue();
            
            validationErrors.add(new ErrorResponse.ValidationError(
                    fieldName, 
                    errorMessage, 
                    rejectedValue != null ? rejectedValue.toString() : null
            ));
        });
        
        ErrorResponse errorResponse = ErrorResponse.builder()
                .error("Validation Failed")
                .message("Request validation failed")
                .details("Please check the request parameters and try again")
                .timestamp(LocalDateTime.now())
                .path(getPath(request))
                .status(HttpStatus.BAD_REQUEST.value())
                .validationErrors(validationErrors)
                .build();
        
        return new ResponseEntity<>(errorResponse, HttpStatus.BAD_REQUEST);
    }

    /**
     * Handle authentication exceptions.
     * 
     * @param ex the exception
     * @param request the web request
     * @return error response with 401 status
     */
    @ExceptionHandler({AuthenticationException.class, BadCredentialsException.class})
    public ResponseEntity<ErrorResponse> handleAuthenticationException(
            AuthenticationException ex, WebRequest request) {
        
        logger.warn("Authentication failed: {}", ex.getMessage());
        
        ErrorResponse errorResponse = ErrorResponse.builder()
                .error("Authentication Failed")
                .message("Invalid credentials or authentication required")
                .details(ex.getMessage())
                .timestamp(LocalDateTime.now())
                .path(getPath(request))
                .status(HttpStatus.UNAUTHORIZED.value())
                .build();
        
        return new ResponseEntity<>(errorResponse, HttpStatus.UNAUTHORIZED);
    }

    /**
     * Handle access denied exceptions.
     * 
     * @param ex the exception
     * @param request the web request
     * @return error response with 403 status
     */
    @ExceptionHandler(AccessDeniedException.class)
    public ResponseEntity<ErrorResponse> handleAccessDeniedException(
            AccessDeniedException ex, WebRequest request) {
        
        logger.warn("Access denied: {}", ex.getMessage());
        
        ErrorResponse errorResponse = ErrorResponse.builder()
                .error("Access Denied")
                .message("You don't have permission to access this resource")
                .details(ex.getMessage())
                .timestamp(LocalDateTime.now())
                .path(getPath(request))
                .status(HttpStatus.FORBIDDEN.value())
                .build();
        
        return new ResponseEntity<>(errorResponse, HttpStatus.FORBIDDEN);
    }

    /**
     * Handle illegal argument exceptions.
     * 
     * @param ex the exception
     * @param request the web request
     * @return error response with 400 status
     */
    @ExceptionHandler(IllegalArgumentException.class)
    public ResponseEntity<ErrorResponse> handleIllegalArgumentException(
            IllegalArgumentException ex, WebRequest request) {
        
        logger.warn("Illegal argument: {}", ex.getMessage());
        
        ErrorResponse errorResponse = ErrorResponse.builder()
                .error("Bad Request")
                .message(ex.getMessage())
                .timestamp(LocalDateTime.now())
                .path(getPath(request))
                .status(HttpStatus.BAD_REQUEST.value())
                .build();
        
        return new ResponseEntity<>(errorResponse, HttpStatus.BAD_REQUEST);
    }

    /**
     * Handle illegal state exceptions.
     * 
     * @param ex the exception
     * @param request the web request
     * @return error response with 409 status
     */
    @ExceptionHandler(IllegalStateException.class)
    public ResponseEntity<ErrorResponse> handleIllegalStateException(
            IllegalStateException ex, WebRequest request) {
        
        logger.warn("Illegal state: {}", ex.getMessage());
        
        ErrorResponse errorResponse = ErrorResponse.builder()
                .error("Conflict")
                .message(ex.getMessage())
                .timestamp(LocalDateTime.now())
                .path(getPath(request))
                .status(HttpStatus.CONFLICT.value())
                .build();
        
        return new ResponseEntity<>(errorResponse, HttpStatus.CONFLICT);
    }

    /**
     * Handle all other exceptions.
     * 
     * @param ex the exception
     * @param request the web request
     * @return error response with 500 status
     */
    @ExceptionHandler(Exception.class)
    public ResponseEntity<ErrorResponse> handleGenericException(
            Exception ex, WebRequest request) {
        
        logger.error("Unexpected error occurred: {}", ex.getMessage(), ex);
        
        ErrorResponse errorResponse = ErrorResponse.builder()
                .error("Internal Server Error")
                .message("An unexpected error occurred")
                .details(isDevelopmentMode() ? ex.getMessage() : "Please contact support if the problem persists")
                .timestamp(LocalDateTime.now())
                .path(getPath(request))
                .status(HttpStatus.INTERNAL_SERVER_ERROR.value())
                .build();
        
        return new ResponseEntity<>(errorResponse, HttpStatus.INTERNAL_SERVER_ERROR);
    }

    /**
     * Extract the request path from WebRequest.
     * 
     * @param request the web request
     * @return request path
     */
    private String getPath(WebRequest request) {
        return request.getDescription(false).replace("uri=", "");
    }

    /**
     * Check if application is running in development mode.
     * 
     * @return true if in development mode
     */
    private boolean isDevelopmentMode() {
        String profile = System.getProperty("spring.profiles.active");
        return "dev".equals(profile) || "development".equals(profile);
    }
}