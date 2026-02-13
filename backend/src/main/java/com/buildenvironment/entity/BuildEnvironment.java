package com.buildenvironment.entity;

import jakarta.persistence.*;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.LastModifiedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.UUID;

/**
 * Entity representing a build environment configuration.
 * Stores information about configured build tools, environment variables,
 * and the current status of the environment.
 */
@Entity
@Table(name = "build_environments")
@EntityListeners(AuditingEntityListener.class)
public class BuildEnvironment {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    @Column(name = "environment_id")
    private UUID environmentId;

    @Column(name = "environment_name", nullable = false, length = 100)
    private String environmentName;

    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false)
    private EnvironmentStatus status = EnvironmentStatus.INACTIVE;

    @CreatedDate
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @LastModifiedDate
    @Column(name = "last_modified", nullable = false)
    private LocalDateTime lastModified;

    @ElementCollection
    @CollectionTable(name = "environment_variables", 
                    joinColumns = @JoinColumn(name = "environment_id"))
    @MapKeyColumn(name = "variable_name")
    @Column(name = "variable_value")
    private Map<String, String> environmentVariables = new HashMap<>();

    @OneToMany(mappedBy = "buildEnvironment", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<InstalledTool> installedTools = new ArrayList<>();

    @OneToMany(mappedBy = "buildEnvironment", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<RepositoryAccess> repositoryAccesses = new ArrayList<>();

    @OneToMany(mappedBy = "buildEnvironment", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<ConfigurationSnapshot> configurationSnapshots = new ArrayList<>();

    @OneToMany(mappedBy = "buildEnvironment", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<ConfigurationHistoryItem> configurationHistory = new ArrayList<>();

    @Column(name = "docker_base_image")
    private String dockerBaseImage;

    @Column(name = "docker_registry_url")
    private String dockerRegistryUrl;

    @Column(name = "health_status")
    @Enumerated(EnumType.STRING)
    private HealthStatus healthStatus = HealthStatus.UNKNOWN;

    @Column(name = "last_health_check")
    private LocalDateTime lastHealthCheck;

    @Column(name = "uptime_seconds")
    private Long uptimeSeconds = 0L;

    // Constructors
    public BuildEnvironment() {}

    public BuildEnvironment(String environmentName) {
        this.environmentName = environmentName;
    }

    // Getters and Setters
    public UUID getEnvironmentId() {
        return environmentId;
    }

    public void setEnvironmentId(UUID environmentId) {
        this.environmentId = environmentId;
    }

    public String getEnvironmentName() {
        return environmentName;
    }

    public void setEnvironmentName(String environmentName) {
        this.environmentName = environmentName;
    }

    public EnvironmentStatus getStatus() {
        return status;
    }

    public void setStatus(EnvironmentStatus status) {
        this.status = status;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }

    public LocalDateTime getLastModified() {
        return lastModified;
    }

    public void setLastModified(LocalDateTime lastModified) {
        this.lastModified = lastModified;
    }

    public Map<String, String> getEnvironmentVariables() {
        return environmentVariables;
    }

    public void setEnvironmentVariables(Map<String, String> environmentVariables) {
        this.environmentVariables = environmentVariables;
    }

    public List<InstalledTool> getInstalledTools() {
        return installedTools;
    }

    public void setInstalledTools(List<InstalledTool> installedTools) {
        this.installedTools = installedTools;
    }

    public List<RepositoryAccess> getRepositoryAccesses() {
        return repositoryAccesses;
    }

    public void setRepositoryAccesses(List<RepositoryAccess> repositoryAccesses) {
        this.repositoryAccesses = repositoryAccesses;
    }

    public List<ConfigurationSnapshot> getConfigurationSnapshots() {
        return configurationSnapshots;
    }

    public void setConfigurationSnapshots(List<ConfigurationSnapshot> configurationSnapshots) {
        this.configurationSnapshots = configurationSnapshots;
    }

    public List<ConfigurationHistoryItem> getConfigurationHistory() {
        return configurationHistory;
    }

    public void setConfigurationHistory(List<ConfigurationHistoryItem> configurationHistory) {
        this.configurationHistory = configurationHistory;
    }

    public String getDockerBaseImage() {
        return dockerBaseImage;
    }

    public void setDockerBaseImage(String dockerBaseImage) {
        this.dockerBaseImage = dockerBaseImage;
    }

    public String getDockerRegistryUrl() {
        return dockerRegistryUrl;
    }

    public void setDockerRegistryUrl(String dockerRegistryUrl) {
        this.dockerRegistryUrl = dockerRegistryUrl;
    }

    public HealthStatus getHealthStatus() {
        return healthStatus;
    }

    public void setHealthStatus(HealthStatus healthStatus) {
        this.healthStatus = healthStatus;
    }

    public LocalDateTime getLastHealthCheck() {
        return lastHealthCheck;
    }

    public void setLastHealthCheck(LocalDateTime lastHealthCheck) {
        this.lastHealthCheck = lastHealthCheck;
    }

    public Long getUptimeSeconds() {
        return uptimeSeconds;
    }

    public void setUptimeSeconds(Long uptimeSeconds) {
        this.uptimeSeconds = uptimeSeconds;
    }

    // Enums
    public enum EnvironmentStatus {
        ACTIVE, INACTIVE, CONFIGURING, ERROR, DELETED
    }

    public enum HealthStatus {
        HEALTHY, DEGRADED, UNHEALTHY, UNKNOWN
    }
}