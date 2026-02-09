package com.bookstore.onlinebookstore.exception;

import com.bookstore.onlinebookstore.dto.CommonDto;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.ConstraintViolation;
import jakarta.validation.ConstraintViolationException;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.http.converter.HttpMessageNotReadableException;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.core.AuthenticationException;
import org.springframework.validation.FieldError;
import org.springframework.web.HttpRequestMethodNotSupportedException;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.MissingServletRequestParameterException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import org.springframework.web.method.annotation.MethodArgumentTypeMismatchException;
import org.springframework.web.servlet.NoHandlerFoundException;

import java.util.ArrayList;
import java.util.List;
import java.util.Set;

/**
 * Global exception handler for the online bookstore application.
 * Handles all exceptions and converts them to appropriate HTTP responses.
 */
@RestControllerAdvice
public class GlobalExceptionHandler {

    private static final Logger logger = LoggerFactory.getLogger(GlobalExceptionHandler.class);

    /**
     * Handle resource not found exceptions.
     */
    @ExceptionHandler(ResourceNotFoundException.class)
    public ResponseEntity<CommonDto.ErrorResponse> handleResourceNotFound(
            ResourceNotFoundException ex, HttpServletRequest request) {
        logger.warn("Resource not found: {}", ex.getMessage());
        
        CommonDto.ErrorResponse error = new CommonDto.ErrorResponse(
            "RESOURCE_NOT_FOUND",
            ex.getMessage(),
            request.getRequestURI()
        );
        
        return ResponseEntity.status(HttpStatus.NOT_FOUND).body(error);
    }

    /**
     * Handle duplicate resource exceptions.
     */
    @ExceptionHandler(DuplicateResourceException.class)
    public ResponseEntity<CommonDto.ErrorResponse> handleDuplicateResource(
            DuplicateResourceException ex, HttpServletRequest request) {
        logger.warn("Duplicate resource: {}", ex.getMessage());
        
        CommonDto.ErrorResponse error = new CommonDto.ErrorResponse(
            "DUPLICATE_RESOURCE",
            ex.getMessage(),
            request.getRequestURI()
        );
        
        return ResponseEntity.status(HttpStatus.CONFLICT).body(error);
    }

    /**
     * Handle invalid credentials exceptions.
     */
    @ExceptionHandler({InvalidCredentialsException.class, BadCredentialsException.class})
    public ResponseEntity<CommonDto.ErrorResponse> handleInvalidCredentials(
            Exception ex, HttpServletRequest request) {
        logger.warn("Invalid credentials: {}", ex.getMessage());
        
        CommonDto.ErrorResponse error = new CommonDto.ErrorResponse(
            "INVALID_CREDENTIALS",
            "Invalid email or password",
            request.getRequestURI()
        );
        
        return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(error);
    }

    /**
     * Handle invalid token exceptions.
     */
    @ExceptionHandler(InvalidTokenException.class)
    public ResponseEntity<CommonDto.ErrorResponse> handleInvalidToken(
            InvalidTokenException ex, HttpServletRequest request) {
        logger.warn("Invalid token: {}", ex.getMessage());
        
        CommonDto.ErrorResponse error = new CommonDto.ErrorResponse(
            "INVALID_TOKEN",
            ex.getMessage(),
            request.getRequestURI()
        );
        
        return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(error);
    }

    /**
     * Handle user already exists exceptions.
     */
    @ExceptionHandler(UserAlreadyExistsException.class)
    public ResponseEntity<CommonDto.ErrorResponse> handleUserAlreadyExists(
            UserAlreadyExistsException ex, HttpServletRequest request) {
        logger.warn("User already exists: {}", ex.getMessage());
        
        CommonDto.ErrorResponse error = new CommonDto.ErrorResponse(
            "USER_ALREADY_EXISTS",
            ex.getMessage(),
            request.getRequestURI()
        );
        
        return ResponseEntity.status(HttpStatus.CONFLICT).body(error);
    }

    /**
     * Handle insufficient stock exceptions.
     */
    @ExceptionHandler(InsufficientStockException.class)
    public ResponseEntity<CommonDto.ErrorResponse> handleInsufficientStock(
            InsufficientStockException ex, HttpServletRequest request) {
        logger.warn("Insufficient stock: {}", ex.getMessage());
        
        CommonDto.ErrorResponse error = new CommonDto.ErrorResponse(
            "INSUFFICIENT_STOCK",
            ex.getMessage(),
            request.getRequestURI()
        );
        
        return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(error);
    }

    /**
     * Handle invalid operation exceptions.
     */
    @ExceptionHandler(InvalidOperationException.class)
    public ResponseEntity<CommonDto.ErrorResponse> handleInvalidOperation(
            InvalidOperationException ex, HttpServletRequest request) {
        logger.warn("Invalid operation: {}", ex.getMessage());
        
        CommonDto.ErrorResponse error = new CommonDto.ErrorResponse(
            "INVALID_OPERATION",
            ex.getMessage(),
            request.getRequestURI()
        );
        
        return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(error);
    }

    /**
     * Handle access denied exceptions.
     */
    @ExceptionHandler({AccessDeniedException.class, org.springframework.security.access.AccessDeniedException.class})
    public ResponseEntity<CommonDto.ErrorResponse> handleAccessDenied(
            Exception ex, HttpServletRequest request) {
        logger.warn("Access denied: {}", ex.getMessage());
        
        CommonDto.ErrorResponse error = new CommonDto.ErrorResponse(
            "ACCESS_DENIED",
            "Access denied",
            request.getRequestURI()
        );
        
        return ResponseEntity.status(HttpStatus.FORBIDDEN).body(error);
    }

    /**
     * Handle authentication exceptions.
     */
    @ExceptionHandler(AuthenticationException.class)
    public ResponseEntity<CommonDto.ErrorResponse> handleAuthentication(
            AuthenticationException ex, HttpServletRequest request) {
        logger.warn("Authentication failed: {}", ex.getMessage());
        
        CommonDto.ErrorResponse error = new CommonDto.ErrorResponse(
            "AUTHENTICATION_FAILED",
            "Authentication required",
            request.getRequestURI()
        );
        
        return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(error);
    }

    /**
     * Handle validation errors.
     */
    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<CommonDto.ErrorResponse> handleValidationErrors(
            MethodArgumentNotValidException ex, HttpServletRequest request) {
        logger.warn("Validation failed: {}", ex.getMessage());
        
        List<CommonDto.ValidationError> validationErrors = new ArrayList<>();
        for (FieldError fieldError : ex.getBindingResult().getFieldErrors()) {
            validationErrors.add(new CommonDto.ValidationError(
                fieldError.getField(),
                fieldError.getDefaultMessage(),
                fieldError.getRejectedValue() != null ? fieldError.getRejectedValue().toString() : null
            ));
        }
        
        CommonDto.ErrorResponse error = new CommonDto.ErrorResponse(
            "VALIDATION_FAILED",
            "Invalid input data",
            request.getRequestURI()
        );
        error.setValidationErrors(validationErrors);
        
        return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(error);
    }

    /**
     * Handle constraint violation exceptions.
     */
    @ExceptionHandler(ConstraintViolationException.class)
    public ResponseEntity<CommonDto.ErrorResponse> handleConstraintViolation(
            ConstraintViolationException ex, HttpServletRequest request) {
        logger.warn("Constraint violation: {}", ex.getMessage());
        
        List<CommonDto.ValidationError> validationErrors = new ArrayList<>();
        Set<ConstraintViolation<?>> violations = ex.getConstraintViolations();
        for (ConstraintViolation<?> violation : violations) {
            validationErrors.add(new CommonDto.ValidationError(
                violation.getPropertyPath().toString(),
                violation.getMessage(),
                violation.getInvalidValue() != null ? violation.getInvalidValue().toString() : null
            ));
        }
        
        CommonDto.ErrorResponse error = new CommonDto.ErrorResponse(
            "VALIDATION_FAILED",
            "Invalid input data",
            request.getRequestURI()
        );
        error.setValidationErrors(validationErrors);
        
        return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(error);
    }

    /**
     * Handle data integrity violation exceptions.
     */
    @ExceptionHandler(DataIntegrityViolationException.class)
    public ResponseEntity<CommonDto.ErrorResponse> handleDataIntegrityViolation(
            DataIntegrityViolationException ex, HttpServletRequest request) {
        logger.error("Data integrity violation: {}", ex.getMessage());
        
        CommonDto.ErrorResponse error = new CommonDto.ErrorResponse(
            "DATA_INTEGRITY_VIOLATION",
            "Data integrity constraint violated",
            request.getRequestURI()
        );
        
        return ResponseEntity.status(HttpStatus.CONFLICT).body(error);
    }

    /**
     * Handle method argument type mismatch exceptions.
     */
    @ExceptionHandler(MethodArgumentTypeMismatchException.class)
    public ResponseEntity<CommonDto.ErrorResponse> handleTypeMismatch(
            MethodArgumentTypeMismatchException ex, HttpServletRequest request) {
        logger.warn("Type mismatch: {}", ex.getMessage());
        
        CommonDto.ErrorResponse error = new CommonDto.ErrorResponse(
            "INVALID_PARAMETER_TYPE",
            String.format("Invalid value '%s' for parameter '%s'", ex.getValue(), ex.getName()),
            request.getRequestURI()
        );
        
        return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(error);
    }

    /**
     * Handle missing request parameter exceptions.
     */
    @ExceptionHandler(MissingServletRequestParameterException.class)
    public ResponseEntity<CommonDto.ErrorResponse> handleMissingParameter(
            MissingServletRequestParameterException ex, HttpServletRequest request) {
        logger.warn("Missing parameter: {}", ex.getMessage());
        
        CommonDto.ErrorResponse error = new CommonDto.ErrorResponse(
            "MISSING_PARAMETER",
            String.format("Required parameter '%s' is missing", ex.getParameterName()),
            request.getRequestURI()
        );
        
        return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(error);
    }

    /**
     * Handle HTTP message not readable exceptions.
     */
    @ExceptionHandler(HttpMessageNotReadableException.class)
    public ResponseEntity<CommonDto.ErrorResponse> handleMessageNotReadable(
            HttpMessageNotReadableException ex, HttpServletRequest request) {
        logger.warn("Message not readable: {}", ex.getMessage());
        
        CommonDto.ErrorResponse error = new CommonDto.ErrorResponse(
            "INVALID_REQUEST_BODY",
            "Invalid request body format",
            request.getRequestURI()
        );
        
        return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(error);
    }

    /**
     * Handle HTTP method not supported exceptions.
     */
    @ExceptionHandler(HttpRequestMethodNotSupportedException.class)
    public ResponseEntity<CommonDto.ErrorResponse> handleMethodNotSupported(
            HttpRequestMethodNotSupportedException ex, HttpServletRequest request) {
        logger.warn("Method not supported: {}", ex.getMessage());
        
        CommonDto.ErrorResponse error = new CommonDto.ErrorResponse(
            "METHOD_NOT_SUPPORTED",
            String.format("HTTP method '%s' is not supported for this endpoint", ex.getMethod()),
            request.getRequestURI()
        );
        
        return ResponseEntity.status(HttpStatus.METHOD_NOT_ALLOWED).body(error);
    }

    /**
     * Handle no handler found exceptions.
     */
    @ExceptionHandler(NoHandlerFoundException.class)
    public ResponseEntity<CommonDto.ErrorResponse> handleNoHandlerFound(
            NoHandlerFoundException ex, HttpServletRequest request) {
        logger.warn("No handler found: {}", ex.getMessage());
        
        CommonDto.ErrorResponse error = new CommonDto.ErrorResponse(
            "ENDPOINT_NOT_FOUND",
            String.format("Endpoint '%s %s' not found", ex.getHttpMethod(), ex.getRequestURL()),
            request.getRequestURI()
        );
        
        return ResponseEntity.status(HttpStatus.NOT_FOUND).body(error);
    }

    /**
     * Handle all other exceptions.
     */
    @ExceptionHandler(Exception.class)
    public ResponseEntity<CommonDto.ErrorResponse> handleGenericException(
            Exception ex, HttpServletRequest request) {
        logger.error("Unexpected error occurred", ex);
        
        CommonDto.ErrorResponse error = new CommonDto.ErrorResponse(
            "INTERNAL_SERVER_ERROR",
            "An unexpected error occurred",
            request.getRequestURI()
        );
        
        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(error);
    }
}