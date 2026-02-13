package com.buildenvironment.entity;

import jakarta.persistence.*;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

import java.time.LocalDateTime;
import java.util.UUID;

/**
 * Entity representing repository access configuration for a build environment.
 */
@Entity
@Table(name = "repository_access")
@EntityListeners(AuditingEntityListener.class)
public class RepositoryAccess {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    @Column(name = "access_id")
    private UUID accessId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "environment_id", nullable = false)
    private BuildEnvironment buildEnvironment;

    @Column(name = "repository_url", nullable = false)
    private String repositoryUrl;

    @Enumerated(EnumType.STRING)
    @Column(name = "authentication_type", nullable = false)
    private AuthenticationType authenticationType;

    @Column(name = "username")
    private String username;

    @Column(name = "password_encrypted")
    private String passwordEncrypted;

    @Column(name = "token_encrypted")
    private String tokenEncrypted;

    @Column(name = "ssh_private_key_encrypted", columnDefinition = "TEXT")
    private String sshPrivateKeyEncrypted;

    @Column(name = "ssh_passphrase_encrypted")
    private String sshPassphraseEncrypted;

    @Enumerated(EnumType.STRING)
    @Column(name = "access_level")
    private AccessLevel accessLevel = AccessLevel.READ;

    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false)
    private AccessStatus status = AccessStatus.CONFIGURED;

    @CreatedDate
    @Column(name = "configured_at", nullable = false, updatable = false)
    private LocalDateTime configuredAt;

    @Column(name = "last_validated")
    private LocalDateTime lastValidated;

    @Column(name = "validation_status")
    @Enumerated(EnumType.STRING)
    private ValidationStatus validationStatus;

    @Column(name = "validation_message")
    private String validationMessage;

    @Column(name = "response_time_ms")
    private Integer responseTimeMs;

    // Constructors
    public RepositoryAccess() {}

    public RepositoryAccess(BuildEnvironment buildEnvironment, String repositoryUrl, AuthenticationType authenticationType) {
        this.buildEnvironment = buildEnvironment;
        this.repositoryUrl = repositoryUrl;
        this.authenticationType = authenticationType;
    }

    // Getters and Setters
    public UUID getAccessId() {
        return accessId;
    }

    public void setAccessId(UUID accessId) {
        this.accessId = accessId;
    }

    public BuildEnvironment getBuildEnvironment() {
        return buildEnvironment;
    }

    public void setBuildEnvironment(BuildEnvironment buildEnvironment) {
        this.buildEnvironment = buildEnvironment;
    }

    public String getRepositoryUrl() {
        return repositoryUrl;
    }

    public void setRepositoryUrl(String repositoryUrl) {
        this.repositoryUrl = repositoryUrl;
    }

    public AuthenticationType getAuthenticationType() {
        return authenticationType;
    }

    public void setAuthenticationType(AuthenticationType authenticationType) {
        this.authenticationType = authenticationType;
    }

    public String getUsername() {
        return username;
    }

    public void setUsername(String username) {
        this.username = username;
    }

    public String getPasswordEncrypted() {
        return passwordEncrypted;
    }

    public void setPasswordEncrypted(String passwordEncrypted) {
        this.passwordEncrypted = passwordEncrypted;
    }

    public String getTokenEncrypted() {
        return tokenEncrypted;
    }

    public void setTokenEncrypted(String tokenEncrypted) {
        this.tokenEncrypted = tokenEncrypted;
    }

    public String getSshPrivateKeyEncrypted() {
        return sshPrivateKeyEncrypted;
    }

    public void setSshPrivateKeyEncrypted(String sshPrivateKeyEncrypted) {
        this.sshPrivateKeyEncrypted = sshPrivateKeyEncrypted;
    }

    public String getSshPassphraseEncrypted() {
        return sshPassphraseEncrypted;
    }

    public void setSshPassphraseEncrypted(String sshPassphraseEncrypted) {
        this.sshPassphraseEncrypted = sshPassphraseEncrypted;
    }

    public AccessLevel getAccessLevel() {
        return accessLevel;
    }

    public void setAccessLevel(AccessLevel accessLevel) {
        this.accessLevel = accessLevel;
    }

    public AccessStatus getStatus() {
        return status;
    }

    public void setStatus(AccessStatus status) {
        this.status = status;
    }

    public LocalDateTime getConfiguredAt() {
        return configuredAt;
    }

    public void setConfiguredAt(LocalDateTime configuredAt) {
        this.configuredAt = configuredAt;
    }

    public LocalDateTime getLastValidated() {
        return lastValidated;
    }

    public void setLastValidated(LocalDateTime lastValidated) {
        this.lastValidated = lastValidated;
    }

    public ValidationStatus getValidationStatus() {
        return validationStatus;
    }

    public void setValidationStatus(ValidationStatus validationStatus) {
        this.validationStatus = validationStatus;
    }

    public String getValidationMessage() {
        return validationMessage;
    }

    public void setValidationMessage(String validationMessage) {
        this.validationMessage = validationMessage;
    }

    public Integer getResponseTimeMs() {
        return responseTimeMs;
    }

    public void setResponseTimeMs(Integer responseTimeMs) {
        this.responseTimeMs = responseTimeMs;
    }

    // Enums
    public enum AuthenticationType {
        TOKEN, SSH_KEY, USERNAME_PASSWORD
    }

    public enum AccessLevel {
        READ, write, admin
    }

    public enum AccessStatus {
        CONFIGURED, VALIDATING, ACTIVE, ERROR
    }

    public enum ValidationStatus {
        SUCCESS, AUTHENTICATION_FAILED, AUTHORIZATION_FAILED, NETWORK_ERROR, REPOSITORY_NOT_FOUND
    }
}