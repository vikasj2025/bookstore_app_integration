package com.buildenvironment.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import org.hibernate.validator.constraints.URL;

/**
 * Request DTO for Maven Wrapper download operation.
 */
public class MavenWrapperDownloadRequest {

    @NotBlank(message = "Project path is required")
    private String projectPath;

    @NotBlank(message = "Maven version is required")
    @Pattern(regexp = "^\\d+\\.\\d+\\.\\d+$", message = "Maven version must follow semantic versioning (e.g., 3.8.6)")
    private String mavenVersion;

    @URL(message = "Repository URL must be a valid URL")
    private String repositoryUrl;

    private Boolean forceDownload = false;

    // Constructors
    public MavenWrapperDownloadRequest() {}

    public MavenWrapperDownloadRequest(String projectPath, String mavenVersion) {
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

    public String getRepositoryUrl() {
        return repositoryUrl;
    }

    public void setRepositoryUrl(String repositoryUrl) {
        this.repositoryUrl = repositoryUrl;
    }

    public Boolean getForceDownload() {
        return forceDownload;
    }

    public void setForceDownload(Boolean forceDownload) {
        this.forceDownload = forceDownload;
    }

    @Override
    public String toString() {
        return "MavenWrapperDownloadRequest{" +
                "projectPath='" + projectPath + '\'' +
                ", mavenVersion='" + mavenVersion + '\'' +
                ", repositoryUrl='" + repositoryUrl + '\'' +
                ", forceDownload=" + forceDownload +
                '}';
    }
}