package com.mavenbootstrap.dto;

import java.time.Instant;
import java.util.UUID;

/**
 * DTO for bootstrap response.
 */
public class BootstrapResponse {

    private UUID bootstrapId;
    private String status;
    private String message;
    private Instant estimatedCompletion;
    private String downloadUrl;

    // Constructors
    public BootstrapResponse() {}

    public BootstrapResponse(UUID bootstrapId, String status, String message) {
        this.bootstrapId = bootstrapId;
        this.status = status;
        this.message = message;
    }

    // Getters and Setters
    public UUID getBootstrapId() {
        return bootstrapId;
    }

    public void setBootstrapId(UUID bootstrapId) {
        this.bootstrapId = bootstrapId;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    public String getMessage() {
        return message;
    }

    public void setMessage(String message) {
        this.message = message;
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
}