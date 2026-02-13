package com.buildenvironment.entity;

import jakarta.persistence.*;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

/**
 * Entity representing a configuration snapshot for rollback purposes.
 */
@Entity
@Table(name = "configuration_snapshots")
@EntityListeners(AuditingEntityListener.class)
public class ConfigurationSnapshot {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    @Column(name = "snapshot_id")
    private UUID snapshotId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "environment_id", nullable = false)
    private BuildEnvironment buildEnvironment;

    @Column(name = "name", nullable = false, length = 100)
    private String name;

    @Column(name = "description", length = 500)
    private String description;

    @CreatedDate
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @Column(name = "created_by", nullable = false)
    private String createdBy;

    @Column(name = "is_stable")
    private Boolean isStable = false;

    @ElementCollection
    @CollectionTable(name = "snapshot_tags", 
                    joinColumns = @JoinColumn(name = "snapshot_id"))
    @Column(name = "tag")
    private List<String> tags = new ArrayList<>();

    @Column(name = "configuration_data", columnDefinition = "TEXT")
    private String configurationData; // JSON string containing the snapshot data

    @Enumerated(EnumType.STRING)
    @Column(name = "status")
    private SnapshotStatus status = SnapshotStatus.CREATING;

    @Column(name = "build_tools_count")
    private Integer buildToolsCount = 0;

    @Column(name = "environment_variables_count")
    private Integer environmentVariablesCount = 0;

    @Column(name = "repository_access_count")
    private Integer repositoryAccessCount = 0;

    @Column(name = "has_docker_config")
    private Boolean hasDockerConfig = false;

    // Constructors
    public ConfigurationSnapshot() {}

    public ConfigurationSnapshot(BuildEnvironment buildEnvironment, String name, String createdBy) {
        this.buildEnvironment = buildEnvironment;
        this.name = name;
        this.createdBy = createdBy;
    }

    // Getters and Setters
    public UUID getSnapshotId() {
        return snapshotId;
    }

    public void setSnapshotId(UUID snapshotId) {
        this.snapshotId = snapshotId;
    }

    public BuildEnvironment getBuildEnvironment() {
        return buildEnvironment;
    }

    public void setBuildEnvironment(BuildEnvironment buildEnvironment) {
        this.buildEnvironment = buildEnvironment;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }

    public String getCreatedBy() {
        return createdBy;
    }

    public void setCreatedBy(String createdBy) {
        this.createdBy = createdBy;
    }

    public Boolean getIsStable() {
        return isStable;
    }

    public void setIsStable(Boolean isStable) {
        this.isStable = isStable;
    }

    public List<String> getTags() {
        return tags;
    }

    public void setTags(List<String> tags) {
        this.tags = tags;
    }

    public String getConfigurationData() {
        return configurationData;
    }

    public void setConfigurationData(String configurationData) {
        this.configurationData = configurationData;
    }

    public SnapshotStatus getStatus() {
        return status;
    }

    public void setStatus(SnapshotStatus status) {
        this.status = status;
    }

    public Integer getBuildToolsCount() {
        return buildToolsCount;
    }

    public void setBuildToolsCount(Integer buildToolsCount) {
        this.buildToolsCount = buildToolsCount;
    }

    public Integer getEnvironmentVariablesCount() {
        return environmentVariablesCount;
    }

    public void setEnvironmentVariablesCount(Integer environmentVariablesCount) {
        this.environmentVariablesCount = environmentVariablesCount;
    }

    public Integer getRepositoryAccessCount() {
        return repositoryAccessCount;
    }

    public void setRepositoryAccessCount(Integer repositoryAccessCount) {
        this.repositoryAccessCount = repositoryAccessCount;
    }

    public Boolean getHasDockerConfig() {
        return hasDockerConfig;
    }

    public void setHasDockerConfig(Boolean hasDockerConfig) {
        this.hasDockerConfig = hasDockerConfig;
    }

    // Enums
    public enum SnapshotStatus {
        CREATING, COMPLETED, FAILED
    }
}