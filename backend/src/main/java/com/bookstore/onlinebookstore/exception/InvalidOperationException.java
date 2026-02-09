package com.bookstore.onlinebookstore.exception;

/**
 * Exception thrown when an invalid operation is attempted.
 */
public class InvalidOperationException extends BookstoreExceptions.BookstoreException {
    public InvalidOperationException(String message) {
        super(message);
    }

    public InvalidOperationException(String message, Throwable cause) {
        super(message, cause);
    }
}