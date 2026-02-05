package com.mavenbootstrap.dto;

import com.mavenbootstrap.entity.BootstrapLog;

import java.time.Instant;
import java.util.List;
import java.util.UUID;

/**
 * DTO for bootstrap status response.
 */
public class BootstrapStatusResponse {

    private UUID bootstrapId;
    private String status;
    private Integer progress;
    private String currentStep;
    private Instant startTime;
    private Instant completionTime;
    private String errorMessage;
    private List<BootstrapLog> logs;

    // Constructors
    public BootstrapStatusResponse() {}

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

    public String getErrorMessage() {
        return errorMessage;
    }

    public void setErrorMessage(String errorMessage) {
        this.errorMessage = errorMessage;
    }

    public List<BootstrapLog> getLogs() {
        return logs;
    }

    public void setLogs(List<BootstrapLog> logs) {
        this.logs = logs;
    }
}