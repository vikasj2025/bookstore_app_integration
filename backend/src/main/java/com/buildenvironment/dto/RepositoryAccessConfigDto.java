package com.buildenvironment.dto;

import com.buildenvironment.entity.RepositoryAccess;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotNull;
import org.hibernate.validator.constraints.URL;

/**
 * DTO for repository access configuration.
 */
public class RepositoryAccessConfigDto {

    @NotNull(message = "Repository URL is required")
    @URL(message = "Repository URL must be a valid URL")
    private String repositoryUrl;

    @NotNull(message = "Authentication type is required")
    private RepositoryAccess.AuthenticationType authenticationType;

    @Valid
    private RepositoryCredentialsDto credentials;

    // Constructors
    public RepositoryAccessConfigDto() {}

    public RepositoryAccessConfigDto(String repositoryUrl, RepositoryAccess.AuthenticationType authenticationType) {
        this.repositoryUrl = repositoryUrl;
        this.authenticationType = authenticationType;
    }

    // Getters and Setters
    public String getRepositoryUrl() {
        return repositoryUrl;
    }

    public void setRepositoryUrl(String repositoryUrl) {
        this.repositoryUrl = repositoryUrl;
    }

    public RepositoryAccess.AuthenticationType getAuthenticationType() {
        return authenticationType;
    }

    public void setAuthenticationType(RepositoryAccess.AuthenticationType authenticationType) {
        this.authenticationType = authenticationType;
    }

    public RepositoryCredentialsDto getCredentials() {
        return credentials;
    }

    public void setCredentials(RepositoryCredentialsDto credentials) {
        this.credentials = credentials;
    }

    @Override
    public String toString() {
        return "RepositoryAccessConfigDto{" +
                "repositoryUrl='" + repositoryUrl + '\'' +
                ", authenticationType=" + authenticationType +
                ", credentials=" + credentials +
                '}';
    }
}