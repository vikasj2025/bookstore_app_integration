package com.mavenbootstrap.dto;

import jakarta.validation.constraints.*;

/**
 * DTO for configuration discovery request.
 */
public class ConfigDiscoveryRequest {

    @NotBlank(message = "Project path is required")
    @Size(max = 1000, message = "Project path must not exceed 1000 characters")
    private String projectPath;

    @Min(value = 1, message = "Scan depth must be at least 1")
    @Max(value = 10, message = "Scan depth must not exceed 10")
    private Integer scanDepth = 3;

    private Boolean includeSubmodules = true;

    // Constructors
    public ConfigDiscoveryRequest() {}

    public ConfigDiscoveryRequest(String projectPath) {
        this.projectPath = projectPath;
    }

    // Getters and Setters
    public String getProjectPath() {
        return projectPath;
    }

    public void setProjectPath(String projectPath) {
        this.projectPath = projectPath;
    }

    public Integer getScanDepth() {
        return scanDepth;
    }

    public void setScanDepth(Integer scanDepth) {
        this.scanDepth = scanDepth;
    }

    public Boolean getIncludeSubmodules() {
        return includeSubmodules;
    }

    public void setIncludeSubmodules(Boolean includeSubmodules) {
        this.includeSubmodules = includeSubmodules;
    }
}