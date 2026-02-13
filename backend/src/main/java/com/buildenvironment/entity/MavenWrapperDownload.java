package com.buildenvironment.entity;

import jakarta.persistence.*;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.LastModifiedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

/**
 * Entity representing a Maven Wrapper download operation.
 */
@Entity
@Table(name = "maven_wrapper_downloads")
@EntityListeners(AuditingEntityListener.class)
public class MavenWrapperDownload {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    @Column(name = "download_id")
    private UUID downloadId;

    @Column(name = "project_path", nullable = false)
    private String projectPath;

    @Column(name = "maven_version", nullable = false)
    private String mavenVersion;

    @Column(name = "repository_url")
    private String repositoryUrl;

    @Column(name = "force_download")
    private Boolean forceDownload = false;

    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false)
    private DownloadStatus status = DownloadStatus.INITIATED;

    @Column(name = "progress")
    private Integer progress = 0;

    @CreatedDate
    @Column(name = "start_time", nullable = false, updatable = false)
    private LocalDateTime startTime;

    @LastModifiedDate
    @Column(name = "last_updated", nullable = false)
    private LocalDateTime lastUpdated;

    @Column(name = "completion_time")
    private LocalDateTime completionTime;

    @Column(name = "estimated_completion_time")
    private LocalDateTime estimatedCompletionTime;

    @Column(name = "error_message")
    private String errorMessage;

    @ElementCollection
    @CollectionTable(name = "downloaded_files", 
                    joinColumns = @JoinColumn(name = "download_id"))
    @Column(name = "file_path")
    private List<String> downloadedFiles = new ArrayList<>();

    // Constructors
    public MavenWrapperDownload() {}

    public MavenWrapperDownload(String projectPath, String mavenVersion) {
        this.projectPath = projectPath;
        this.mavenVersion = mavenVersion;
    }

    // Getters and Setters
    public UUID getDownloadId() {
        return downloadId;
    }

    public void setDownloadId(UUID downloadId) {
        this.downloadId = downloadId;
    }

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

    public DownloadStatus getStatus() {
        return status;
    }

    public void setStatus(DownloadStatus status) {
        this.status = status;
    }

    public Integer getProgress() {
        return progress;
    }

    public void setProgress(Integer progress) {
        this.progress = progress;
    }

    public LocalDateTime getStartTime() {
        return startTime;
    }

    public void setStartTime(LocalDateTime startTime) {
        this.startTime = startTime;
    }

    public LocalDateTime getLastUpdated() {
        return lastUpdated;
    }

    public void setLastUpdated(LocalDateTime lastUpdated) {
        this.lastUpdated = lastUpdated;
    }

    public LocalDateTime getCompletionTime() {
        return completionTime;
    }

    public void setCompletionTime(LocalDateTime completionTime) {
        this.completionTime = completionTime;
    }

    public LocalDateTime getEstimatedCompletionTime() {
        return estimatedCompletionTime;
    }

    public void setEstimatedCompletionTime(LocalDateTime estimatedCompletionTime) {
        this.estimatedCompletionTime = estimatedCompletionTime;
    }

    public String getErrorMessage() {
        return errorMessage;
    }

    public void setErrorMessage(String errorMessage) {
        this.errorMessage = errorMessage;
    }

    public List<String> getDownloadedFiles() {
        return downloadedFiles;
    }

    public void setDownloadedFiles(List<String> downloadedFiles) {
        this.downloadedFiles = downloadedFiles;
    }

    // Enums
    public enum DownloadStatus {
        INITIATED, IN_PROGRESS, COMPLETED, FAILED
    }
}