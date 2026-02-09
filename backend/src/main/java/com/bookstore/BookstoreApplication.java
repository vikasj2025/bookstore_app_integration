package com.bookstore;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.cache.annotation.EnableCaching;
import org.springframework.data.jpa.repository.config.EnableJpaAuditing;
import org.springframework.transaction.annotation.EnableTransactionManagement;

/**
 * Main application class for the Online Bookstore Backend.
 * 
 * This class bootstraps the Spring Boot application with the following features:
 * - JPA Auditing for automatic timestamp management
 * - Caching for improved performance
 * - Transaction management
 */
@SpringBootApplication
@EnableJpaAuditing
@EnableCaching
@EnableTransactionManagement
public class BookstoreApplication {

    public static void main(String[] args) {
        SpringApplication.run(BookstoreApplication.class, args);
    }
}