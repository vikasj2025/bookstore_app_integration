package com.mavenbootstrap;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.cache.annotation.EnableCaching;
import org.springframework.data.jpa.repository.config.EnableJpaAuditing;
import org.springframework.scheduling.annotation.EnableAsync;
import org.springframework.scheduling.annotation.EnableScheduling;

/**
 * Main Spring Boot application class for Maven Wrapper Bootstrap API.
 * 
 * This application provides APIs for automating Maven wrapper setup,
 * secure downloads, configuration discovery, and build monitoring.
 */
@SpringBootApplication
@EnableJpaAuditing
@EnableCaching
@EnableAsync
@EnableScheduling
public class MavenWrapperBootstrapApplication {

    public static void main(String[] args) {
        SpringApplication.run(MavenWrapperBootstrapApplication.class, args);
    }
}