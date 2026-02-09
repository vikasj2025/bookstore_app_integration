package com.bookstore.onlinebookstore.exception;

/**
 * Exception thrown when there is insufficient stock for a requested operation.
 */
public class InsufficientStockException extends BookstoreExceptions.BookstoreException {
    public InsufficientStockException(String message) {
        super(message);
    }

    public InsufficientStockException(String message, Throwable cause) {
        super(message, cause);
    }
}