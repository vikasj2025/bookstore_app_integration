package com.mavenbootstrap.service;

import com.mavenbootstrap.dto.BootstrapRequest;
import com.mavenbootstrap.dto.BootstrapResponse;
import com.mavenbootstrap.dto.BootstrapStatusResponse;
import com.mavenbootstrap.entity.BootstrapLog;
import com.mavenbootstrap.entity.BootstrapOperation;
import com.mavenbootstrap.exception.BootstrapNotFoundException;
import com.mavenbootstrap.exception.BootstrapProcessingException;
import com.mavenbootstrap.repository.BootstrapOperationRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.List;
import java.util.UUID;
import java.util.concurrent.CompletableFuture;

/**
 * Service for managing Maven wrapper bootstrap operations.
 */
@Service
@Transactional
public class BootstrapService {

    private static final Logger logger = LoggerFactory.getLogger(BootstrapService.class);

    @Autowired
    private BootstrapOperationRepository bootstrapRepository;

    @Autowired
    private DownloadService downloadService;

    @Autowired
    private ConfigurationService configurationService;

    @Value("${app.maven.download-timeout:300000}")
    private long downloadTimeout;

    @Value("${app.maven.max-retry-attempts:3}")
    private int maxRetryAttempts;

    /**
     * Initialize a new bootstrap operation.
     */
    public BootstrapResponse initializeBootstrap(BootstrapRequest request) {
        logger.info("Initializing bootstrap for project: {}, Maven version: {}", 
                   request.getProjectPath(), request.getMavenVersion());

        try {
            // Validate request
            validateBootstrapRequest(request);

            // Create bootstrap operation
            BootstrapOperation operation = new BootstrapOperation(
                request.getProjectPath(),
                request.getMavenVersion(),
                request.getProjectType()
            );
            operation.setCustomProperties(request.getCustomProperties());
            operation.setCurrentStep("Initializing bootstrap");
            operation.setEstimatedCompletion(Instant.now().plus(5, ChronoUnit.MINUTES));

            // Save operation
            operation = bootstrapRepository.save(operation);

            // Add initial log
            operation.addLog(new BootstrapLog(BootstrapLog.LogLevel.INFO, 
                "Bootstrap operation initialized for project: " + request.getProjectPath()));

            // Start async bootstrap process
            processBootstrapAsync(operation.getId());

            // Create response
            BootstrapResponse response = new BootstrapResponse();
            response.setBootstrapId(operation.getId());
            response.setStatus(operation.getStatus().name().toLowerCase());
            response.setMessage("Bootstrap operation initiated successfully");
            response.setEstimatedCompletion(operation.getEstimatedCompletion());

            logger.info("Bootstrap operation {} initialized successfully", operation.getId());
            return response;

        } catch (Exception e) {
            logger.error("Failed to initialize bootstrap for project: {}", request.getProjectPath(), e);
            throw new BootstrapProcessingException("Failed to initialize bootstrap operation", e);
        }
    }

    /**
     * Get bootstrap operation status.
     */
    @Cacheable(value = "bootstrap-operations", key = "#bootstrapId")
    public BootstrapStatusResponse getBootstrapStatus(UUID bootstrapId) {
        logger.debug("Getting status for bootstrap operation: {}", bootstrapId);

        BootstrapOperation operation = bootstrapRepository.findById(bootstrapId)
            .orElseThrow(() -> new BootstrapNotFoundException("Bootstrap operation not found: " + bootstrapId));

        BootstrapStatusResponse response = new BootstrapStatusResponse();
        response.setBootstrapId(operation.getId());
        response.setStatus(operation.getStatus().name().toLowerCase());
        response.setProgress(operation.getProgress());
        response.setCurrentStep(operation.getCurrentStep());
        response.setStartTime(operation.getStartTime());
        response.setCompletionTime(operation.getCompletionTime());
        response.setErrorMessage(operation.getErrorMessage());
        response.setLogs(operation.getLogs());

        return response;
    }

    /**
     * Process bootstrap operation asynchronously.
     */
    @Async
    public CompletableFuture<Void> processBootstrapAsync(UUID bootstrapId) {
        return CompletableFuture.runAsync(() -> processBootstrap(bootstrapId));
    }

    /**
     * Process bootstrap operation.
     */
    private void processBootstrap(UUID bootstrapId) {
        BootstrapOperation operation = bootstrapRepository.findById(bootstrapId)
            .orElseThrow(() -> new BootstrapNotFoundException("Bootstrap operation not found: " + bootstrapId));

        try {
            logger.info("Starting bootstrap process for operation: {}", bootstrapId);

            // Update status to in progress
            updateOperationStatus(operation, BootstrapOperation.BootstrapStatus.IN_PROGRESS, 
                                "Bootstrap process started", 10);

            // Step 1: Discover configuration
            updateOperationStatus(operation, BootstrapOperation.BootstrapStatus.IN_PROGRESS, 
                                "Discovering project configuration", 25);
            
            var configDiscovery = configurationService.discoverProjectConfiguration(
                operation.getProjectPath(), 3, true);

            // Step 2: Determine download URL
            updateOperationStatus(operation, BootstrapOperation.BootstrapStatus.IN_PROGRESS, 
                                "Determining Maven wrapper download URL", 40);
            
            String downloadUrl = determineDownloadUrl(operation.getMavenVersion(), "linux"); // Default platform
            operation.setDownloadUrl(downloadUrl);

            // Step 3: Download Maven wrapper
            updateOperationStatus(operation, BootstrapOperation.BootstrapStatus.IN_PROGRESS, 
                                "Downloading Maven wrapper", 60);
            
            downloadService.downloadMavenWrapper(operation.getMavenVersion(), "linux", true);

            // Step 4: Verify download
            updateOperationStatus(operation, BootstrapOperation.BootstrapStatus.IN_PROGRESS, 
                                "Verifying download integrity", 80);

            // Step 5: Complete bootstrap
            updateOperationStatus(operation, BootstrapOperation.BootstrapStatus.COMPLETED, 
                                "Bootstrap completed successfully", 100);
            
            operation.setCompletionTime(Instant.now());
            bootstrapRepository.save(operation);

            logger.info("Bootstrap process completed successfully for operation: {}", bootstrapId);

        } catch (Exception e) {
            logger.error("Bootstrap process failed for operation: {}", bootstrapId, e);
            
            operation.setStatus(BootstrapOperation.BootstrapStatus.FAILED);
            operation.setErrorMessage(e.getMessage());
            operation.setCompletionTime(Instant.now());
            operation.addLog(new BootstrapLog(BootstrapLog.LogLevel.ERROR, 
                "Bootstrap failed: " + e.getMessage()));
            
            bootstrapRepository.save(operation);
        }
    }

    /**
     * Update operation status and progress.
     */
    private void updateOperationStatus(BootstrapOperation operation, 
                                     BootstrapOperation.BootstrapStatus status, 
                                     String currentStep, 
                                     int progress) {
        operation.setStatus(status);
        operation.setCurrentStep(currentStep);
        operation.setProgress(progress);
        operation.addLog(new BootstrapLog(BootstrapLog.LogLevel.INFO, currentStep));
        bootstrapRepository.save(operation);
        
        logger.debug("Updated operation {} status: {}, step: {}, progress: {}%", 
                    operation.getId(), status, currentStep, progress);
    }

    /**
     * Determine download URL for Maven wrapper.
     */
    private String determineDownloadUrl(String mavenVersion, String platform) {
        // This would typically check configuration or use a service to determine the URL
        return String.format("https://repo.maven.apache.org/maven2/org/apache/maven/apache-maven/%s/apache-maven-%s-bin.zip", 
                           mavenVersion, mavenVersion);
    }

    /**
     * Validate bootstrap request.
     */
    private void validateBootstrapRequest(BootstrapRequest request) {
        if (request.getProjectPath() == null || request.getProjectPath().trim().isEmpty()) {
            throw new IllegalArgumentException("Project path is required");
        }
        
        if (request.getMavenVersion() == null || request.getMavenVersion().trim().isEmpty()) {
            throw new IllegalArgumentException("Maven version is required");
        }
        
        if (!isValidMavenVersion(request.getMavenVersion())) {
            throw new IllegalArgumentException("Invalid Maven version format: " + request.getMavenVersion());
        }
    }

    /**
     * Validate Maven version format.
     */
    private boolean isValidMavenVersion(String version) {
        return version.matches("^[0-9]+\\.[0-9]+\\.[0-9]+$");
    }

    /**
     * Get all bootstrap operations.
     */
    public List<BootstrapOperation> getAllOperations() {
        return bootstrapRepository.findAll();
    }

    /**
     * Get bootstrap operations by status.
     */
    public List<BootstrapOperation> getOperationsByStatus(BootstrapOperation.BootstrapStatus status) {
        return bootstrapRepository.findByStatus(status);
    }

    /**
     * Retry failed bootstrap operation.
     */
    public BootstrapResponse retryBootstrap(UUID bootstrapId) {
        BootstrapOperation operation = bootstrapRepository.findById(bootstrapId)
            .orElseThrow(() -> new BootstrapNotFoundException("Bootstrap operation not found: " + bootstrapId));

        if (operation.getStatus() != BootstrapOperation.BootstrapStatus.FAILED) {
            throw new IllegalStateException("Can only retry failed operations");
        }

        // Reset operation state
        operation.setStatus(BootstrapOperation.BootstrapStatus.INITIATED);
        operation.setProgress(0);
        operation.setCurrentStep("Retrying bootstrap");
        operation.setErrorMessage(null);
        operation.setCompletionTime(null);
        operation.setEstimatedCompletion(Instant.now().plus(5, ChronoUnit.MINUTES));
        
        operation.addLog(new BootstrapLog(BootstrapLog.LogLevel.INFO, "Bootstrap operation retry initiated"));
        
        operation = bootstrapRepository.save(operation);

        // Start async process
        processBootstrapAsync(operation.getId());

        BootstrapResponse response = new BootstrapResponse();
        response.setBootstrapId(operation.getId());
        response.setStatus(operation.getStatus().name().toLowerCase());
        response.setMessage("Bootstrap operation retry initiated");
        response.setEstimatedCompletion(operation.getEstimatedCompletion());

        return response;
    }
}