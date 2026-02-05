package com.mavenbootstrap.exception;

/**
 * Exception thrown when bootstrap processing fails.
 */
public class BootstrapProcessingException extends RuntimeException {

    public BootstrapProcessingException(String message) {
        super(message);
    }

    public BootstrapProcessingException(String message, Throwable cause) {
        super(message, cause);
    }
}