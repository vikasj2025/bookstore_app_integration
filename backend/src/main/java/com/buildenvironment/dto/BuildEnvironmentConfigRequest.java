package com.buildenvironment.dto;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.Size;

import java.util.List;
import java.util.Map;

/**
 * Request DTO for build environment configuration.
 */
public class BuildEnvironmentConfigRequest {

    @NotBlank(message = "Environment name is required")
    @Size(min = 1, max = 100, message = "Environment name must be between 1 and 100 characters")
    private String environmentName;

    @NotEmpty(message = "At least one build tool must be specified")
    @Valid
    private List<BuildToolConfigDto> buildTools;

    private Map<String, String> environmentVariables;

    @Valid
    private DockerConfigDto dockerConfig;

    @Valid
    private List<RepositoryAccessConfigDto> repositoryAccess;

    // Constructors
    public BuildEnvironmentConfigRequest() {}

    public BuildEnvironmentConfigRequest(String environmentName, List<BuildToolConfigDto> buildTools) {
        this.environmentName = environmentName;
        this.buildTools = buildTools;
    }

    // Getters and Setters
    public String getEnvironmentName() {
        return environmentName;
    }

    public void setEnvironmentName(String environmentName) {
        this.environmentName = environmentName;
    }

    public List<BuildToolConfigDto> getBuildTools() {
        return buildTools;
    }

    public void setBuildTools(List<BuildToolConfigDto> buildTools) {
        this.buildTools = buildTools;
    }

    public Map<String, String> getEnvironmentVariables() {
        return environmentVariables;
    }

    public void setEnvironmentVariables(Map<String, String> environmentVariables) {
        this.environmentVariables = environmentVariables;
    }

    public DockerConfigDto getDockerConfig() {
        return dockerConfig;
    }

    public void setDockerConfig(DockerConfigDto dockerConfig) {
        this.dockerConfig = dockerConfig;
    }

    public List<RepositoryAccessConfigDto> getRepositoryAccess() {
        return repositoryAccess;
    }

    public void setRepositoryAccess(List<RepositoryAccessConfigDto> repositoryAccess) {
        this.repositoryAccess = repositoryAccess;
    }

    @Override
    public String toString() {
        return "BuildEnvironmentConfigRequest{" +
                "environmentName='" + environmentName + '\'' +
                ", buildTools=" + buildTools +
                ", environmentVariables=" + environmentVariables +
                ", dockerConfig=" + dockerConfig +
                ", repositoryAccess=" + repositoryAccess +
                '}';
    }
}