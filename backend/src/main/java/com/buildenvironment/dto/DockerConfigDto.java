package com.buildenvironment.dto;

import jakarta.validation.Valid;
import org.hibernate.validator.constraints.URL;

/**
 * DTO for Docker configuration.
 */
public class DockerConfigDto {

    private String baseImage;

    @URL(message = "Registry URL must be a valid URL")
    private String registryUrl;

    @Valid
    private RegistryCredentialsDto registryCredentials;

    // Constructors
    public DockerConfigDto() {}

    public DockerConfigDto(String baseImage) {
        this.baseImage = baseImage;
    }

    // Getters and Setters
    public String getBaseImage() {
        return baseImage;
    }

    public void setBaseImage(String baseImage) {
        this.baseImage = baseImage;
    }

    public String getRegistryUrl() {
        return registryUrl;
    }

    public void setRegistryUrl(String registryUrl) {
        this.registryUrl = registryUrl;
    }

    public RegistryCredentialsDto getRegistryCredentials() {
        return registryCredentials;
    }

    public void setRegistryCredentials(RegistryCredentialsDto registryCredentials) {
        this.registryCredentials = registryCredentials;
    }

    @Override
    public String toString() {
        return "DockerConfigDto{" +
                "baseImage='" + baseImage + '\'' +
                ", registryUrl='" + registryUrl + '\'' +
                ", registryCredentials=" + registryCredentials +
                '}';
    }
}