package com.mavenbootstrap.exception;

/**
 * Exception thrown when file verification fails.
 */
public class VerificationException extends RuntimeException {

    public VerificationException(String message) {
        super(message);
    }

    public VerificationException(String message, Throwable cause) {
        super(message, cause);
    }
}