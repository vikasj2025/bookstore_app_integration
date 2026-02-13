package com.buildenvironment.service;

import com.buildenvironment.dto.RepositoryAccessConfigDto;
import com.buildenvironment.entity.BuildEnvironment;
import com.buildenvironment.entity.RepositoryAccess;
import com.buildenvironment.exception.ResourceNotFoundException;
import com.buildenvironment.repository.BuildEnvironmentRepository;
import com.buildenvironment.repository.RepositoryAccessRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;
import java.util.concurrent.CompletableFuture;

/**
 * Service for managing repository access configurations.
 */
@Service
@Transactional
public class RepositoryAccessService {

    private static final Logger logger = LoggerFactory.getLogger(RepositoryAccessService.class);

    @Autowired
    private RepositoryAccessRepository repositoryAccessRepository;

    @Autowired
    private BuildEnvironmentRepository buildEnvironmentRepository;

    @Autowired
    private EncryptionService encryptionService;

    /**
     * Configures repository access for an environment.
     */
    public RepositoryAccess configureRepositoryAccess(UUID environmentId, 
                                                     RepositoryAccessConfigDto config, 
                                                     String userId) {
        logger.info("Configuring repository access for environment {} to repository {}", 
                   environmentId, config.getRepositoryUrl());

        BuildEnvironment environment = buildEnvironmentRepository.findById(environmentId)
                .orElseThrow(() -> new ResourceNotFoundException("Build environment not found: " + environmentId));

        // Check if repository access already exists
        if (repositoryAccessRepository.existsByEnvironmentAndRepositoryUrl(
                environmentId, config.getRepositoryUrl())) {
            throw new IllegalArgumentException(
                "Repository access already configured for URL: " + config.getRepositoryUrl());
        }

        // Create repository access record
        RepositoryAccess repositoryAccess = new RepositoryAccess(
            environment, config.getRepositoryUrl(), config.getAuthenticationType());
        
        // Encrypt and store credentials
        if (config.getCredentials() != null) {
            encryptAndStoreCredentials(repositoryAccess, config);
        }

        repositoryAccess.setStatus(RepositoryAccess.AccessStatus.CONFIGURED);
        repositoryAccess = repositoryAccessRepository.save(repositoryAccess);

        // Start async validation
        validateRepositoryAccessAsync(repositoryAccess.getAccessId());

        logger.info("Repository access configured with ID: {}", repositoryAccess.getAccessId());
        return repositoryAccess;
    }

    /**
     * Validates repository access credentials.
     */
    public RepositoryAccess validateRepositoryAccess(UUID accessId) {
        RepositoryAccess repositoryAccess = repositoryAccessRepository.findById(accessId)
                .orElseThrow(() -> new ResourceNotFoundException("Repository access not found: " + accessId));

        logger.info("Validating repository access for ID: {}", accessId);

        long startTime = System.currentTimeMillis();
        
        try {
            // Perform actual validation based on authentication type
            boolean isValid = performValidation(repositoryAccess);
            
            long responseTime = System.currentTimeMillis() - startTime;
            
            if (isValid) {
                repositoryAccess.setValidationStatus(RepositoryAccess.ValidationStatus.SUCCESS);
                repositoryAccess.setStatus(RepositoryAccess.AccessStatus.ACTIVE);
                repositoryAccess.setValidationMessage("Repository access validated successfully");
            } else {
                repositoryAccess.setValidationStatus(RepositoryAccess.ValidationStatus.AUTHENTICATION_FAILED);
                repositoryAccess.setStatus(RepositoryAccess.AccessStatus.ERROR);
                repositoryAccess.setValidationMessage("Authentication failed");
            }
            
            repositoryAccess.setLastValidated(LocalDateTime.now());
            repositoryAccess.setResponseTimeMs((int) responseTime);
            
        } catch (Exception e) {
            logger.error("Repository validation failed for ID: {}", accessId, e);
            
            repositoryAccess.setValidationStatus(RepositoryAccess.ValidationStatus.NETWORK_ERROR);
            repositoryAccess.setStatus(RepositoryAccess.AccessStatus.ERROR);
            repositoryAccess.setValidationMessage("Validation error: " + e.getMessage());
            repositoryAccess.setLastValidated(LocalDateTime.now());
        }

        return repositoryAccessRepository.save(repositoryAccess);
    }

    /**
     * Gets repository access configurations for an environment.
     */
    public List<RepositoryAccess> getRepositoryAccess(UUID environmentId) {
        return repositoryAccessRepository.findByBuildEnvironment_EnvironmentId(environmentId);
    }

    /**
     * Gets active repository access configurations for an environment.
     */
    public List<RepositoryAccess> getActiveRepositoryAccess(UUID environmentId) {
        return repositoryAccessRepository.findActiveByEnvironmentId(environmentId);
    }

    /**
     * Removes repository access configuration.
     */
    public void removeRepositoryAccess(UUID accessId, String userId) {
        RepositoryAccess repositoryAccess = repositoryAccessRepository.findById(accessId)
                .orElseThrow(() -> new ResourceNotFoundException("Repository access not found: " + accessId));

        logger.info("Removing repository access for ID: {}", accessId);
        repositoryAccessRepository.delete(repositoryAccess);
    }

    /**
     * Finds repository access configurations that need validation.
     */
    public List<RepositoryAccess> findRepositoryAccessNeedingValidation(int hoursThreshold) {
        LocalDateTime threshold = LocalDateTime.now().minusHours(hoursThreshold);
        return repositoryAccessRepository.findNeedingValidation(threshold);
    }

    /**
     * Validates repository access asynchronously.
     */
    @Async
    public CompletableFuture<Void> validateRepositoryAccessAsync(UUID accessId) {
        try {
            validateRepositoryAccess(accessId);
        } catch (Exception e) {
            logger.error("Async repository validation failed for ID: {}", accessId, e);
        }
        return CompletableFuture.completedFuture(null);
    }

    private void encryptAndStoreCredentials(RepositoryAccess repositoryAccess, 
                                          RepositoryAccessConfigDto config) {
        var credentials = config.getCredentials();
        
        if (credentials.getUsername() != null) {
            repositoryAccess.setUsername(credentials.getUsername());
        }
        
        if (credentials.getPassword() != null) {
            repositoryAccess.setPasswordEncrypted(
                encryptionService.encrypt(credentials.getPassword()));
        }
        
        if (credentials.getToken() != null) {
            repositoryAccess.setTokenEncrypted(
                encryptionService.encrypt(credentials.getToken()));
        }
        
        if (credentials.getSshPrivateKey() != null) {
            repositoryAccess.setSshPrivateKeyEncrypted(
                encryptionService.encrypt(credentials.getSshPrivateKey()));
        }
        
        if (credentials.getSshPassphrase() != null) {
            repositoryAccess.setSshPassphraseEncrypted(
                encryptionService.encrypt(credentials.getSshPassphrase()));
        }
    }

    private boolean performValidation(RepositoryAccess repositoryAccess) {
        // This is a simplified validation - in a real implementation,
        // you would actually test the repository connection
        
        switch (repositoryAccess.getAuthenticationType()) {
            case TOKEN:
                return repositoryAccess.getTokenEncrypted() != null;
            case SSH_KEY:
                return repositoryAccess.getSshPrivateKeyEncrypted() != null;
            case USERNAME_PASSWORD:
                return repositoryAccess.getUsername() != null && 
                       repositoryAccess.getPasswordEncrypted() != null;
            default:
                return false;
        }
    }
}