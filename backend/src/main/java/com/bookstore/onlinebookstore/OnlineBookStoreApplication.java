package com.bookstore.onlinebookstore;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.cache.annotation.EnableCaching;
import org.springframework.data.jpa.repository.config.EnableJpaAuditing;
import org.springframework.scheduling.annotation.EnableAsync;
import org.springframework.transaction.annotation.EnableTransactionManagement;

/**
 * Main Spring Boot application class for the Online Bookstore.
 * 
 * This class serves as the entry point for the Spring Boot application and enables
 * various Spring features through annotations:
 * - @SpringBootApplication: Enables auto-configuration, component scanning, and configuration
 * - @EnableJpaAuditing: Enables JPA auditing for automatic timestamp management
 * - @EnableCaching: Enables Spring's caching abstraction
 * - @EnableAsync: Enables asynchronous method execution
 * - @EnableTransactionManagement: Enables declarative transaction management
 * 
 * The application follows Spring Boot best practices and provides a solid foundation
 * for the online bookstore REST API with automatic configuration and component discovery.
 */
@SpringBootApplication
@EnableJpaAuditing
@EnableCaching
@EnableAsync
@EnableTransactionManagement
public class OnlineBookStoreApplication {

    /**
     * Main method that starts the Spring Boot application.
     * 
     * This method bootstraps the entire application by:
     * 1. Initializing the Spring application context
     * 2. Performing auto-configuration based on classpath dependencies
     * 3. Setting up the embedded servlet container (Tomcat)
     * 4. Enabling component scanning across the application package structure
     * 5. Loading application configuration properties
     * 6. Creating and wiring all Spring beans
     * 7. Making the application ready to handle HTTP requests
     * 
     * @param args Command line arguments passed to the application
     */
    public static void main(String[] args) {
        SpringApplication.run(OnlineBookStoreApplication.class, args);
    }

}