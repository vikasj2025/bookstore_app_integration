package com.buildenvironment.service;

import com.buildenvironment.dto.BuildEnvironmentConfigRequest;
import com.buildenvironment.entity.BuildEnvironment;
import com.buildenvironment.entity.ConfigurationHistoryItem;
import com.buildenvironment.entity.InstalledTool;
import com.buildenvironment.entity.RepositoryAccess;
import com.buildenvironment.exception.ResourceNotFoundException;
import com.buildenvironment.repository.BuildEnvironmentRepository;
import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;
import java.util.concurrent.CompletableFuture;

/**
 * Service for managing build environments.
 */
@Service
@Transactional
public class BuildEnvironmentService {

    private static final Logger logger = LoggerFactory.getLogger(BuildEnvironmentService.class);

    @Autowired
    private BuildEnvironmentRepository buildEnvironmentRepository;

    @Autowired
    private BuildToolService buildToolService;

    @Autowired
    private RepositoryAccessService repositoryAccessService;

    @Autowired
    private ObjectMapper objectMapper;

    /**
     * Configures a new build environment.
     */
    public BuildEnvironment configureBuildEnvironment(BuildEnvironmentConfigRequest request, String userId) {
        logger.info("Configuring build environment: {}", request.getEnvironmentName());

        // Check if environment name already exists
        if (buildEnvironmentRepository.existsByEnvironmentNameIgnoreCase(request.getEnvironmentName())) {
            throw new IllegalArgumentException("Build environment with name '" + request.getEnvironmentName() + "' already exists");
        }

        // Create build environment
        BuildEnvironment environment = new BuildEnvironment(request.getEnvironmentName());
        environment.setStatus(BuildEnvironment.EnvironmentStatus.CONFIGURING);
        
        if (request.getEnvironmentVariables() != null) {
            environment.setEnvironmentVariables(request.getEnvironmentVariables());
        }
        
        if (request.getDockerConfig() != null) {
            environment.setDockerBaseImage(request.getDockerConfig().getBaseImage());
            environment.setDockerRegistryUrl(request.getDockerConfig().getRegistryUrl());
        }

        environment = buildEnvironmentRepository.save(environment);

        // Add configuration history
        addConfigurationHistory(environment, ConfigurationHistoryItem.ChangeType.CREATE, 
                              userId, "Environment created", request);

        // Start async configuration
        configureEnvironmentAsync(environment.getEnvironmentId(), request, userId);

        return environment;
    }

    /**
     * Gets build environment details by ID.
     */
    @Cacheable(value = "buildEnvironments", key = "#environmentId")
    public BuildEnvironment getBuildEnvironment(UUID environmentId) {
        return buildEnvironmentRepository.findById(environmentId)
                .orElseThrow(() -> new ResourceNotFoundException("Build environment not found: " + environmentId));
    }

    /**
     * Gets all build environments.
     */
    public List<BuildEnvironment> getAllBuildEnvironments() {
        return buildEnvironmentRepository.findAll();
    }

    /**
     * Gets build environments by status.
     */
    public List<BuildEnvironment> getBuildEnvironmentsByStatus(BuildEnvironment.EnvironmentStatus status) {
        return buildEnvironmentRepository.findByStatus(status);
    }

    /**
     * Deletes a build environment.
     */
    @CacheEvict(value = "buildEnvironments", key = "#environmentId")
    public void deleteBuildEnvironment(UUID environmentId, String userId) {
        BuildEnvironment environment = getBuildEnvironment(environmentId);
        
        if (environment.getStatus() == BuildEnvironment.EnvironmentStatus.CONFIGURING) {
            throw new IllegalStateException("Cannot delete environment while it is being configured");
        }

        logger.info("Deleting build environment: {}", environment.getEnvironmentName());
        
        // Add configuration history
        addConfigurationHistory(environment, ConfigurationHistoryItem.ChangeType.DELETE, 
                              userId, "Environment deleted", null);
        
        environment.setStatus(BuildEnvironment.EnvironmentStatus.DELETED);
        buildEnvironmentRepository.save(environment);
    }

    /**
     * Updates environment health status.
     */
    @CacheEvict(value = "buildEnvironments", key = "#environmentId")
    public void updateHealthStatus(UUID environmentId, BuildEnvironment.HealthStatus healthStatus) {
        BuildEnvironment environment = getBuildEnvironment(environmentId);
        environment.setHealthStatus(healthStatus);
        environment.setLastHealthCheck(LocalDateTime.now());
        buildEnvironmentRepository.save(environment);
    }

    /**
     * Configures environment asynchronously.
     */
    @Async
    public CompletableFuture<Void> configureEnvironmentAsync(UUID environmentId, 
                                                           BuildEnvironmentConfigRequest request, 
                                                           String userId) {
        try {
            BuildEnvironment environment = getBuildEnvironment(environmentId);
            
            logger.info("Starting async configuration for environment: {}", environment.getEnvironmentName());

            // Install build tools
            if (request.getBuildTools() != null && !request.getBuildTools().isEmpty()) {
                for (var toolConfig : request.getBuildTools()) {
                    buildToolService.installBuildTool(environmentId, toolConfig, userId);
                }
            }

            // Configure repository access
            if (request.getRepositoryAccess() != null && !request.getRepositoryAccess().isEmpty()) {
                for (var repoConfig : request.getRepositoryAccess()) {
                    repositoryAccessService.configureRepositoryAccess(environmentId, repoConfig, userId);
                }
            }

            // Update environment status
            environment.setStatus(BuildEnvironment.EnvironmentStatus.ACTIVE);
            environment.setHealthStatus(BuildEnvironment.HealthStatus.HEALTHY);
            buildEnvironmentRepository.save(environment);

            // Add configuration history
            addConfigurationHistory(environment, ConfigurationHistoryItem.ChangeType.UPDATE, 
                                  userId, "Environment configuration completed", null);

            logger.info("Environment configuration completed for: {}", environment.getEnvironmentName());

        } catch (Exception e) {
            logger.error("Environment configuration failed for ID: {}", environmentId, e);
            
            BuildEnvironment environment = getBuildEnvironment(environmentId);
            environment.setStatus(BuildEnvironment.EnvironmentStatus.ERROR);
            environment.setHealthStatus(BuildEnvironment.HealthStatus.UNHEALTHY);
            buildEnvironmentRepository.save(environment);

            // Add error to configuration history
            addConfigurationHistory(environment, ConfigurationHistoryItem.ChangeType.UPDATE, 
                                  userId, "Environment configuration failed: " + e.getMessage(), null);
        }

        return CompletableFuture.completedFuture(null);
    }

    /**
     * Finds environments that need health checks.
     */
    public List<BuildEnvironment> findEnvironmentsNeedingHealthCheck(int hoursThreshold) {
        LocalDateTime threshold = LocalDateTime.now().minusHours(hoursThreshold);
        return buildEnvironmentRepository.findEnvironmentsNeedingHealthCheck(threshold);
    }

    private void addConfigurationHistory(BuildEnvironment environment, 
                                       ConfigurationHistoryItem.ChangeType changeType,
                                       String changedBy, 
                                       String summary, 
                                       Object details) {
        ConfigurationHistoryItem historyItem = new ConfigurationHistoryItem(
            environment, changeType, changedBy, summary);
        
        if (details != null) {
            try {
                historyItem.setDetails(objectMapper.writeValueAsString(details));
            } catch (JsonProcessingException e) {
                logger.warn("Failed to serialize configuration details", e);
            }
        }
        
        environment.getConfigurationHistory().add(historyItem);
    }
}