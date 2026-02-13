package com.buildenvironment.entity;

import jakarta.persistence.*;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

import java.time.LocalDateTime;
import java.util.UUID;

/**
 * Entity representing an installed build tool in a build environment.
 */
@Entity
@Table(name = "installed_tools")
@EntityListeners(AuditingEntityListener.class)
public class InstalledTool {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    @Column(name = "tool_id")
    private UUID toolId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "environment_id", nullable = false)
    private BuildEnvironment buildEnvironment;

    @Enumerated(EnumType.STRING)
    @Column(name = "tool_type", nullable = false)
    private ToolType toolType;

    @Column(name = "version", nullable = false)
    private String version;

    @Column(name = "installation_path")
    private String installationPath;

    @Column(name = "is_default")
    private Boolean isDefault = false;

    @CreatedDate
    @Column(name = "installed_at", nullable = false, updatable = false)
    private LocalDateTime installedAt;

    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false)
    private ToolStatus status = ToolStatus.ACTIVE;

    @Column(name = "configuration", columnDefinition = "TEXT")
    private String configuration; // JSON string for tool-specific configuration

    // Constructors
    public InstalledTool() {}

    public InstalledTool(BuildEnvironment buildEnvironment, ToolType toolType, String version) {
        this.buildEnvironment = buildEnvironment;
        this.toolType = toolType;
        this.version = version;
    }

    // Getters and Setters
    public UUID getToolId() {
        return toolId;
    }

    public void setToolId(UUID toolId) {
        this.toolId = toolId;
    }

    public BuildEnvironment getBuildEnvironment() {
        return buildEnvironment;
    }

    public void setBuildEnvironment(BuildEnvironment buildEnvironment) {
        this.buildEnvironment = buildEnvironment;
    }

    public ToolType getToolType() {
        return toolType;
    }

    public void setToolType(ToolType toolType) {
        this.toolType = toolType;
    }

    public String getVersion() {
        return version;
    }

    public void setVersion(String version) {
        this.version = version;
    }

    public String getInstallationPath() {
        return installationPath;
    }

    public void setInstallationPath(String installationPath) {
        this.installationPath = installationPath;
    }

    public Boolean getIsDefault() {
        return isDefault;
    }

    public void setIsDefault(Boolean isDefault) {
        this.isDefault = isDefault;
    }

    public LocalDateTime getInstalledAt() {
        return installedAt;
    }

    public void setInstalledAt(LocalDateTime installedAt) {
        this.installedAt = installedAt;
    }

    public ToolStatus getStatus() {
        return status;
    }

    public void setStatus(ToolStatus status) {
        this.status = status;
    }

    public String getConfiguration() {
        return configuration;
    }

    public void setConfiguration(String configuration) {
        this.configuration = configuration;
    }

    // Enums
    public enum ToolType {
        MAVEN, GRADLE, NPM, DOCKER, NODEJS, JAVA
    }

    public enum ToolStatus {
        ACTIVE, INACTIVE, ERROR
    }
}