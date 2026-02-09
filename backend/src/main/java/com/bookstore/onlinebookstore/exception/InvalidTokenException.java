package com.bookstore.onlinebookstore.exception;

/**
 * Exception thrown when a JWT token is invalid or expired.
 */
public class InvalidTokenException extends BookstoreExceptions.BookstoreException {
    public InvalidTokenException(String message) {
        super(message);
    }

    public InvalidTokenException(String message, Throwable cause) {
        super(message, cause);
    }
}