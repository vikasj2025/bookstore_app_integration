package com.bookstore.onlinebookstore;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.cache.annotation.EnableCaching;
import org.springframework.data.jpa.repository.config.EnableJpaAuditing;
import org.springframework.transaction.annotation.EnableTransactionManagement;

/**
 * Main Spring Boot Application class for Online Bookstore
 * 
 * This class serves as the entry point for the Spring Boot application.
 * It enables auto-configuration, component scanning, and configuration properties.
 * 
 * Annotations:
 * - @SpringBootApplication: Enables auto-configuration, component scanning, and configuration
 * - @EnableCaching: Enables Spring's caching support for Redis integration
 * - @EnableJpaAuditing: Enables JPA auditing for automatic timestamp management
 * - @EnableTransactionManagement: Enables Spring's transaction management
 */
@SpringBootApplication
@EnableCaching
@EnableJpaAuditing
@EnableTransactionManagement
public class OnlineBookStoreApplication {

    /**
     * Main method to bootstrap the Spring Boot application
     * 
     * @param args command line arguments passed to the application
     */
    public static void main(String[] args) {
        SpringApplication.run(OnlineBookStoreApplication.class, args);
    }
}
