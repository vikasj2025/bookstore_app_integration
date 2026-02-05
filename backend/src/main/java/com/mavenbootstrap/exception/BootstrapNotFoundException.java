package com.mavenbootstrap.exception;

/**
 * Exception thrown when a bootstrap operation is not found.
 */
public class BootstrapNotFoundException extends RuntimeException {

    public BootstrapNotFoundException(String message) {
        super(message);
    }

    public BootstrapNotFoundException(String message, Throwable cause) {
        super(message, cause);
    }
}