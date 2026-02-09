package com.bookstore.exception;

/**
 * Exception thrown when attempting to create a user that already exists.
 * 
 * This exception is typically thrown during user registration when
 * the email address is already associated with an existing account.
 */
public class UserAlreadyExistsException extends RuntimeException {

    /**
     * Constructs a new UserAlreadyExistsException with the specified detail message.
     * 
     * @param message the detail message
     */
    public UserAlreadyExistsException(String message) {
        super(message);
    }

    /**
     * Constructs a new UserAlreadyExistsException with the specified detail message and cause.
     * 
     * @param message the detail message
     * @param cause the cause
     */
    public UserAlreadyExistsException(String message, Throwable cause) {
        super(message, cause);
    }
}