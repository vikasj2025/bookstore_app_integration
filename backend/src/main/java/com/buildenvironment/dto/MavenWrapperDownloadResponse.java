package com.buildenvironment.dto;

import com.buildenvironment.entity.MavenWrapperDownload;
import com.fasterxml.jackson.annotation.JsonFormat;

import java.time.LocalDateTime;
import java.util.UUID;

/**
 * Response DTO for Maven Wrapper download operation.
 */
public class MavenWrapperDownloadResponse {

    private UUID downloadId;
    private MavenWrapperDownload.DownloadStatus status;
    private String message;
    
    @JsonFormat(pattern = "yyyy-MM-dd'T'HH:mm:ss")
    private LocalDateTime estimatedCompletionTime;

    // Constructors
    public MavenWrapperDownloadResponse() {}

    public MavenWrapperDownloadResponse(UUID downloadId, MavenWrapperDownload.DownloadStatus status, String message) {
        this.downloadId = downloadId;
        this.status = status;
        this.message = message;
    }

    // Static factory methods
    public static MavenWrapperDownloadResponse fromEntity(MavenWrapperDownload download) {
        MavenWrapperDownloadResponse response = new MavenWrapperDownloadResponse();
        response.setDownloadId(download.getDownloadId());
        response.setStatus(download.getStatus());
        response.setEstimatedCompletionTime(download.getEstimatedCompletionTime());
        
        switch (download.getStatus()) {
            case INITIATED:
                response.setMessage("Maven Wrapper download has been initiated");
                break;
            case IN_PROGRESS:
                response.setMessage("Maven Wrapper download is in progress");
                break;
            case COMPLETED:
                response.setMessage("Maven Wrapper download completed successfully");
                break;
            case FAILED:
                response.setMessage("Maven Wrapper download failed: " + download.getErrorMessage());
                break;
        }
        
        return response;
    }

    // Getters and Setters
    public UUID getDownloadId() {
        return downloadId;
    }

    public void setDownloadId(UUID downloadId) {
        this.downloadId = downloadId;
    }

    public MavenWrapperDownload.DownloadStatus getStatus() {
        return status;
    }

    public void setStatus(MavenWrapperDownload.DownloadStatus status) {
        this.status = status;
    }

    public String getMessage() {
        return message;
    }

    public void setMessage(String message) {
        this.message = message;
    }

    public LocalDateTime getEstimatedCompletionTime() {
        return estimatedCompletionTime;
    }

    public void setEstimatedCompletionTime(LocalDateTime estimatedCompletionTime) {
        this.estimatedCompletionTime = estimatedCompletionTime;
    }

    @Override
    public String toString() {
        return "MavenWrapperDownloadResponse{" +
                "downloadId=" + downloadId +
                ", status=" + status +
                ", message='" + message + '\'' +
                ", estimatedCompletionTime=" + estimatedCompletionTime +
                '}';
    }
}