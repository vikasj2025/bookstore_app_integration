package com.bookstore.onlinebookstore.exception;

/**
 * Exception thrown when a user already exists with the same email.
 */
public class UserAlreadyExistsException extends BookstoreExceptions.BookstoreException {
    public UserAlreadyExistsException(String message) {
        super(message);
    }

    public UserAlreadyExistsException(String message, Throwable cause) {
        super(message, cause);
    }
}