package com.buildenvironment;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.cache.annotation.EnableCaching;
import org.springframework.data.jpa.repository.config.EnableJpaAuditing;
import org.springframework.scheduling.annotation.EnableAsync;
import org.springframework.scheduling.annotation.EnableScheduling;

/**
 * Main application class for the Automated Build Environment Setup and Configuration system.
 * 
 * This application provides APIs for automated build tool detection, provisioning, configuration,
 * and management with secure repository access and rollback capabilities.
 * 
 * Features:
 * - Maven Wrapper auto-download and management
 * - Build environment configuration and provisioning
 * - Secure repository access management
 * - Build tool version management and installation
 * - Environment health monitoring
 * - Configuration snapshot and rollback mechanisms
 * 
 * @author Build Environment Team
 * @version 1.0.0
 */
@SpringBootApplication
@EnableJpaAuditing
@EnableCaching
@EnableAsync
@EnableScheduling
public class AutomatedBuildEnvironmentApplication {

    public static void main(String[] args) {
        SpringApplication.run(AutomatedBuildEnvironmentApplication.class, args);
    }
}