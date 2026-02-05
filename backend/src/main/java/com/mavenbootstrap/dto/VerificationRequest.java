package com.mavenbootstrap.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;

/**
 * DTO for verification request.
 */
public class VerificationRequest {

    @NotBlank(message = "File name is required")
    private String fileName;

    @NotBlank(message = "Checksum is required")
    private String checksum;

    @NotNull(message = "Algorithm is required")
    @Pattern(regexp = "^(SHA256|MD5|SHA1)$", message = "Algorithm must be SHA256, MD5, or SHA1")
    private String algorithm;

    private Long fileSize;

    // Constructors
    public VerificationRequest() {}

    public VerificationRequest(String fileName, String checksum, String algorithm) {
        this.fileName = fileName;
        this.checksum = checksum;
        this.algorithm = algorithm;
    }

    // Getters and Setters
    public String getFileName() {
        return fileName;
    }

    public void setFileName(String fileName) {
        this.fileName = fileName;
    }

    public String getChecksum() {
        return checksum;
    }

    public void setChecksum(String checksum) {
        this.checksum = checksum;
    }

    public String getAlgorithm() {
        return algorithm;
    }

    public void setAlgorithm(String algorithm) {
        this.algorithm = algorithm;
    }

    public Long getFileSize() {
        return fileSize;
    }

    public void setFileSize(Long fileSize) {
        this.fileSize = fileSize;
    }
}