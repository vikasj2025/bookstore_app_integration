package com.mavenbootstrap.entity;

import com.fasterxml.jackson.annotation.JsonManagedReference;
import jakarta.persistence.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;
import org.springframework.data.annotation.CreatedBy;
import org.springframework.data.annotation.LastModifiedBy;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

import java.time.Instant;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.UUID;

/**
 * Entity representing a Maven wrapper bootstrap operation.
 */
@Entity
@Table(name = "bootstrap_operations")
@EntityListeners(AuditingEntityListener.class)
public class BootstrapOperation {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(name = "project_path", nullable = false, length = 1000)
    private String projectPath;

    @Column(name = "maven_version", nullable = false, length = 50)
    private String mavenVersion;

    @Column(name = "project_type", length = 50)
    private String projectType;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private BootstrapStatus status = BootstrapStatus.INITIATED;

    @Column(nullable = false)
    private Integer progress = 0;

    @Column(name = "current_step")
    private String currentStep;

    @Column(name = "start_time", nullable = false)
    private Instant startTime = Instant.now();

    @Column(name = "completion_time")
    private Instant completionTime;

    @Column(name = "estimated_completion")
    private Instant estimatedCompletion;

    @Column(name = "download_url", length = 1000)
    private String downloadUrl;

    @Column(name = "error_message", columnDefinition = "TEXT")
    private String errorMessage;

    @Column(name = "custom_properties", columnDefinition = "jsonb")
    private Map<String, String> customProperties;

    @CreationTimestamp
    @Column(name = "created_at", nullable = false)
    private Instant createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at", nullable = false)
    private Instant updatedAt;

    @CreatedBy
    @Column(name = "created_by")
    private String createdBy;

    @LastModifiedBy
    @Column(name = "updated_by")
    private String updatedBy;

    @OneToMany(mappedBy = "bootstrapOperation", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    @JsonManagedReference
    private List<BootstrapLog> logs = new ArrayList<>();

    // Constructors
    public BootstrapOperation() {}

    public BootstrapOperation(String projectPath, String mavenVersion, String projectType) {
        this.projectPath = projectPath;
        this.mavenVersion = mavenVersion;
        this.projectType = projectType;
    }

    // Getters and Setters
    public UUID getId() {
        return id;
    }

    public void setId(UUID id) {
        this.id = id;
    }

    public String getProjectPath() {
        return projectPath;
    }

    public void setProjectPath(String projectPath) {
        this.projectPath = projectPath;
    }

    public String getMavenVersion() {
        return mavenVersion;
    }

    public void setMavenVersion(String mavenVersion) {
        this.mavenVersion = mavenVersion;
    }

    public String getProjectType() {
        return projectType;
    }

    public void setProjectType(String projectType) {
        this.projectType = projectType;
    }

    public BootstrapStatus getStatus() {
        return status;
    }

    public void setStatus(BootstrapStatus status) {
        this.status = status;
    }

    public Integer getProgress() {
        return progress;
    }

    public void setProgress(Integer progress) {
        this.progress = progress;
    }

    public String getCurrentStep() {
        return currentStep;
    }

    public void setCurrentStep(String currentStep) {
        this.currentStep = currentStep;
    }

    public Instant getStartTime() {
        return startTime;
    }

    public void setStartTime(Instant startTime) {
        this.startTime = startTime;
    }

    public Instant getCompletionTime() {
        return completionTime;
    }

    public void setCompletionTime(Instant completionTime) {
        this.completionTime = completionTime;
    }

    public Instant getEstimatedCompletion() {
        return estimatedCompletion;
    }

    public void setEstimatedCompletion(Instant estimatedCompletion) {
        this.estimatedCompletion = estimatedCompletion;
    }

    public String getDownloadUrl() {
        return downloadUrl;
    }

    public void setDownloadUrl(String downloadUrl) {
        this.downloadUrl = downloadUrl;
    }

    public String getErrorMessage() {
        return errorMessage;
    }

    public void setErrorMessage(String errorMessage) {
        this.errorMessage = errorMessage;
    }

    public Map<String, String> getCustomProperties() {
        return customProperties;
    }

    public void setCustomProperties(Map<String, String> customProperties) {
        this.customProperties = customProperties;
    }

    public Instant getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(Instant createdAt) {
        this.createdAt = createdAt;
    }

    public Instant getUpdatedAt() {
        return updatedAt;
    }

    public void setUpdatedAt(Instant updatedAt) {
        this.updatedAt = updatedAt;
    }

    public String getCreatedBy() {
        return createdBy;
    }

    public void setCreatedBy(String createdBy) {
        this.createdBy = createdBy;
    }

    public String getUpdatedBy() {
        return updatedBy;
    }

    public void setUpdatedBy(String updatedBy) {
        this.updatedBy = updatedBy;
    }

    public List<BootstrapLog> getLogs() {
        return logs;
    }

    public void setLogs(List<BootstrapLog> logs) {
        this.logs = logs;
    }

    // Helper methods
    public void addLog(BootstrapLog log) {
        logs.add(log);
        log.setBootstrapOperation(this);
    }

    public enum BootstrapStatus {
        INITIATED,
        IN_PROGRESS,
        COMPLETED,
        FAILED
    }
}