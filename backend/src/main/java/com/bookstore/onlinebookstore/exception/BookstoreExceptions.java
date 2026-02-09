package com.bookstore.onlinebookstore.exception;

/**
 * Custom exception classes for the online bookstore application.
 */
public class BookstoreExceptions {

    /**
     * Base exception class for all bookstore-related exceptions.
     */
    public static abstract class BookstoreException extends RuntimeException {
        protected BookstoreException(String message) {
            super(message);
        }

        protected BookstoreException(String message, Throwable cause) {
            super(message, cause);
        }
    }
}

/**
 * Exception thrown when a requested resource is not found.
 */
class ResourceNotFoundException extends BookstoreExceptions.BookstoreException {
    public ResourceNotFoundException(String message) {
        super(message);
    }
}

/**
 * Exception thrown when attempting to create a resource that already exists.
 */
class DuplicateResourceException extends BookstoreExceptions.BookstoreException {
    public DuplicateResourceException(String message) {
        super(message);
    }
}

/**
 * Exception thrown when user credentials are invalid.
 */
class InvalidCredentialsException extends BookstoreExceptions.BookstoreException {
    public InvalidCredentialsException(String message) {
        super(message);
    }
}

/**
 * Exception thrown when a JWT token is invalid or expired.
 */
class InvalidTokenException extends BookstoreExceptions.BookstoreException {
    public InvalidTokenException(String message) {
        super(message);
    }
}

/**
 * Exception thrown when a user already exists with the same email.
 */
class UserAlreadyExistsException extends BookstoreExceptions.BookstoreException {
    public UserAlreadyExistsException(String message) {
        super(message);
    }
}

/**
 * Exception thrown when there is insufficient stock for a requested operation.
 */
class InsufficientStockException extends BookstoreExceptions.BookstoreException {
    public InsufficientStockException(String message) {
        super(message);
    }
}

/**
 * Exception thrown when an invalid operation is attempted.
 */
class InvalidOperationException extends BookstoreExceptions.BookstoreException {
    public InvalidOperationException(String message) {
        super(message);
    }
}

/**
 * Exception thrown when access is denied to a resource.
 */
class AccessDeniedException extends BookstoreExceptions.BookstoreException {
    public AccessDeniedException(String message) {
        super(message);
    }
}

/**
 * Exception thrown when rate limiting is exceeded.
 */
class RateLimitExceededException extends BookstoreExceptions.BookstoreException {
    public RateLimitExceededException(String message) {
        super(message);
    }
}

/**
 * Exception thrown when a validation error occurs.
 */
class ValidationException extends BookstoreExceptions.BookstoreException {
    public ValidationException(String message) {
        super(message);
    }
}