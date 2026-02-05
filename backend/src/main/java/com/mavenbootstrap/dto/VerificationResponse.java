package com.mavenbootstrap.dto;

import java.time.Instant;

/**
 * DTO for verification response.
 */
public class VerificationResponse {

    private Boolean isValid;
    private Boolean checksumMatch;
    private Boolean fileSizeMatch;
    private String actualChecksum;
    private Long actualFileSize;
    private Instant verificationTime;

    // Constructors
    public VerificationResponse() {}

    // Getters and Setters
    public Boolean getIsValid() {
        return isValid;
    }

    public void setIsValid(Boolean isValid) {
        this.isValid = isValid;
    }

    public Boolean getChecksumMatch() {
        return checksumMatch;
    }

    public void setChecksumMatch(Boolean checksumMatch) {
        this.checksumMatch = checksumMatch;
    }

    public Boolean getFileSizeMatch() {
        return fileSizeMatch;
    }

    public void setFileSizeMatch(Boolean fileSizeMatch) {
        this.fileSizeMatch = fileSizeMatch;
    }

    public String getActualChecksum() {
        return actualChecksum;
    }

    public void setActualChecksum(String actualChecksum) {
        this.actualChecksum = actualChecksum;
    }

    public Long getActualFileSize() {
        return actualFileSize;
    }

    public void setActualFileSize(Long actualFileSize) {
        this.actualFileSize = actualFileSize;
    }

    public Instant getVerificationTime() {
        return verificationTime;
    }

    public void setVerificationTime(Instant verificationTime) {
        this.verificationTime = verificationTime;
    }
}