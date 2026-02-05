package com.mavenbootstrap.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

import java.util.Map;

/**
 * DTO for bootstrap request.
 */
public class BootstrapRequest {

    @NotBlank(message = "Project path is required")
    @Size(max = 1000, message = "Project path must not exceed 1000 characters")
    private String projectPath;

    @NotBlank(message = "Maven version is required")
    @Pattern(regexp = "^[0-9]+\\.[0-9]+\\.[0-9]+$", message = "Invalid Maven version format")
    private String mavenVersion;

    private String projectType;

    private Map<String, String> customProperties;

    // Constructors
    public BootstrapRequest() {}

    public BootstrapRequest(String projectPath, String mavenVersion) {
        this.projectPath = projectPath;
        this.mavenVersion = mavenVersion;
    }

    // Getters and Setters
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

    public Map<String, String> getCustomProperties() {
        return customProperties;
    }

    public void setCustomProperties(Map<String, String> customProperties) {
        this.customProperties = customProperties;
    }
}