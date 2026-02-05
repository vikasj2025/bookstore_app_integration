package com.mavenbootstrap.dto;

import java.util.List;
import java.util.Map;

/**
 * DTO for configuration discovery response.
 */
public class ConfigDiscoveryResponse {

    private String projectType;
    private String detectedMavenVersion;
    private Map<String, Object> recommendedConfiguration;
    private List<Map<String, Object>> submodules;
    private List<Map<String, Object>> detectedDependencies;

    // Constructors
    public ConfigDiscoveryResponse() {}

    // Getters and Setters
    public String getProjectType() {
        return projectType;
    }

    public void setProjectType(String projectType) {
        this.projectType = projectType;
    }

    public String getDetectedMavenVersion() {
        return detectedMavenVersion;
    }

    public void setDetectedMavenVersion(String detectedMavenVersion) {
        this.detectedMavenVersion = detectedMavenVersion;
    }

    public Map<String, Object> getRecommendedConfiguration() {
        return recommendedConfiguration;
    }

    public void setRecommendedConfiguration(Map<String, Object> recommendedConfiguration) {
        this.recommendedConfiguration = recommendedConfiguration;
    }

    public List<Map<String, Object>> getSubmodules() {
        return submodules;
    }

    public void setSubmodules(List<Map<String, Object>> submodules) {
        this.submodules = submodules;
    }

    public List<Map<String, Object>> getDetectedDependencies() {
        return detectedDependencies;
    }

    public void setDetectedDependencies(List<Map<String, Object>> detectedDependencies) {
        this.detectedDependencies = detectedDependencies;
    }
}