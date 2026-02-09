package com.bookstore;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.cache.annotation.EnableCaching;
import org.springframework.data.jpa.repository.config.EnableJpaAuditing;
import org.springframework.scheduling.annotation.EnableAsync;
import org.springframework.transaction.annotation.EnableTransactionManagement;

/**
 * Main Spring Boot application class for the Online Bookstore API.
 * 
 * This application provides RESTful APIs for:
 * - Book catalog management
 * - User authentication and authorization
 * - Shopping cart functionality
 * - Order management
 * - User profile management
 * 
 * Features:
 * - JWT-based authentication
 * - PostgreSQL database with JPA
 * - Redis caching
 * - Comprehensive error handling
 * - API documentation with OpenAPI/Swagger
 */
@SpringBootApplication
@EnableJpaAuditing
@EnableCaching
@EnableAsync
@EnableTransactionManagement
public class OnlineBookstoreApplication {

    public static void main(String[] args) {
        SpringApplication.run(OnlineBookstoreApplication.class, args);
    }
}
