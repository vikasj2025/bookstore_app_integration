package com.bookstore.onlinebookstore.exception;

/**
 * Exception thrown when user credentials are invalid.
 */
public class InvalidCredentialsException extends BookstoreExceptions.BookstoreException {
    public InvalidCredentialsException(String message) {
        super(message);
    }

    public InvalidCredentialsException(String message, Throwable cause) {
        super(message, cause);
    }
}