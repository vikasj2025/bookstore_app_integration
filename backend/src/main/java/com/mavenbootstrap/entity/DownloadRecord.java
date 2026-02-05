package com.mavenbootstrap.entity;

import jakarta.persistence.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.Instant;
import java.util.UUID;

/**
 * Entity representing a Maven wrapper download record.
 */
@Entity
@Table(name = "download_records")
public class DownloadRecord {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(name = "file_name", nullable = false)
    private String fileName;

    @Column(name = "maven_version", nullable = false, length = 50)
    private String mavenVersion;

    @Column(nullable = false, length = 50)
    private String platform;

    @Column(name = "download_url", nullable = false, length = 1000)
    private String downloadUrl;

    @Column(name = "file_size")
    private Long fileSize;

    @Column(name = "checksum_sha256", length = 64)
    private String checksumSha256;

    @Column(name = "checksum_md5", length = 32)
    private String checksumMd5;

    @Column(name = "download_count")
    private Integer downloadCount = 0;

    @Column(name = "last_downloaded")
    private Instant lastDownloaded;

    @Column(name = "is_verified")
    private Boolean isVerified = false;

    @Column(name = "verification_time")
    private Instant verificationTime;

    @CreationTimestamp
    @Column(name = "created_at", nullable = false)
    private Instant createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at", nullable = false)
    private Instant updatedAt;

    // Constructors
    public DownloadRecord() {}

    public DownloadRecord(String fileName, String mavenVersion, String platform, String downloadUrl) {
        this.fileName = fileName;
        this.mavenVersion = mavenVersion;
        this.platform = platform;
        this.downloadUrl = downloadUrl;
    }

    // Getters and Setters
    public UUID getId() {
        return id;
    }

    public void setId(UUID id) {
        this.id = id;
    }

    public String getFileName() {
        return fileName;
    }

    public void setFileName(String fileName) {
        this.fileName = fileName;
    }

    public String getMavenVersion() {
        return mavenVersion;
    }

    public void setMavenVersion(String mavenVersion) {
        this.mavenVersion = mavenVersion;
    }

    public String getPlatform() {
        return platform;
    }

    public void setPlatform(String platform) {
        this.platform = platform;
    }

    public String getDownloadUrl() {
        return downloadUrl;
    }

    public void setDownloadUrl(String downloadUrl) {
        this.downloadUrl = downloadUrl;
    }

    public Long getFileSize() {
        return fileSize;
    }

    public void setFileSize(Long fileSize) {
        this.fileSize = fileSize;
    }

    public String getChecksumSha256() {
        return checksumSha256;
    }

    public void setChecksumSha256(String checksumSha256) {
        this.checksumSha256 = checksumSha256;
    }

    public String getChecksumMd5() {
        return checksumMd5;
    }

    public void setChecksumMd5(String checksumMd5) {
        this.checksumMd5 = checksumMd5;
    }

    public Integer getDownloadCount() {
        return downloadCount;
    }

    public void setDownloadCount(Integer downloadCount) {
        this.downloadCount = downloadCount;
    }

    public Instant getLastDownloaded() {
        return lastDownloaded;
    }

    public void setLastDownloaded(Instant lastDownloaded) {
        this.lastDownloaded = lastDownloaded;
    }

    public Boolean getIsVerified() {
        return isVerified;
    }

    public void setIsVerified(Boolean isVerified) {
        this.isVerified = isVerified;
    }

    public Instant getVerificationTime() {
        return verificationTime;
    }

    public void setVerificationTime(Instant verificationTime) {
        this.verificationTime = verificationTime;
    }

    public Instant getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(Instant createdAt) {
        this.createdAt = createdAt;
    }

    public Instant getUpdatedAt() {
        return updatedAt;
    }

    public void setUpdatedAt(Instant updatedAt) {
        this.updatedAt = updatedAt;
    }

    // Helper methods
    public void incrementDownloadCount() {
        this.downloadCount++;
        this.lastDownloaded = Instant.now();
    }
}