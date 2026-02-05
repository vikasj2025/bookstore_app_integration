package com.mavenbootstrap.service;

import com.mavenbootstrap.dto.VerificationRequest;
import com.mavenbootstrap.dto.VerificationResponse;
import com.mavenbootstrap.entity.DownloadRecord;
import com.mavenbootstrap.exception.DownloadException;
import com.mavenbootstrap.exception.VerificationException;
import com.mavenbootstrap.repository.DownloadRecordRepository;
import org.apache.commons.codec.digest.DigestUtils;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.core.io.Resource;
import org.springframework.core.io.UrlResource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.client.RestTemplate;

import javax.net.ssl.HttpsURLConnection;
import java.io.*;
import java.net.*;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.security.MessageDigest;
import java.time.Instant;
import java.util.Base64;
import java.util.Optional;

/**
 * Service for handling secure Maven wrapper downloads.
 */
@Service
@Transactional
public class DownloadService {

    private static final Logger logger = LoggerFactory.getLogger(DownloadService.class);

    @Autowired
    private DownloadRecordRepository downloadRecordRepository;

    @Value("${app.maven.default-download-url}")
    private String defaultDownloadUrl;

    @Value("${app.maven.download-timeout:300000}")
    private long downloadTimeout;

    @Value("${app.maven.max-retry-attempts:3}")
    private int maxRetryAttempts;

    @Value("${app.download.base-path:/tmp/maven-downloads}")
    private String downloadBasePath;

    private final RestTemplate restTemplate = new RestTemplate();

    /**
     * Download Maven wrapper with verification.
     */
    public ResponseEntity<Resource> downloadMavenWrapper(String version, String platform, Boolean checksum) {
        logger.info("Downloading Maven wrapper version: {}, platform: {}, checksum: {}", 
                   version, platform, checksum);

        try {
            // Check if download record exists
            Optional<DownloadRecord> existingRecord = downloadRecordRepository
                .findByMavenVersionAndPlatform(version, platform);

            DownloadRecord record;
            if (existingRecord.isPresent()) {
                record = existingRecord.get();
                record.incrementDownloadCount();
            } else {
                record = createNewDownloadRecord(version, platform);
            }

            // Download or get cached file
            Path filePath = downloadWithRetry(record);

            // Verify checksum if requested
            if (checksum != null && checksum) {
                verifyFileIntegrity(filePath, record);
            }

            // Update record
            downloadRecordRepository.save(record);

            // Create response
            Resource resource = new UrlResource(filePath.toUri());
            
            HttpHeaders headers = new HttpHeaders();
            headers.add(HttpHeaders.CONTENT_DISPOSITION, 
                       "attachment; filename=\"" + record.getFileName() + "\"");
            
            if (record.getChecksumSha256() != null) {
                headers.add("X-Checksum-SHA256", record.getChecksumSha256());
            }
            
            if (record.getFileSize() != null) {
                headers.add("X-File-Size", record.getFileSize().toString());
            }

            logger.info("Maven wrapper download completed: {}", record.getFileName());
            return ResponseEntity.ok()
                .headers(headers)
                .body(resource);

        } catch (Exception e) {
            logger.error("Failed to download Maven wrapper: version={}, platform={}", version, platform, e);
            throw new DownloadException("Failed to download Maven wrapper", e);
        }
    }

    /**
     * Verify download integrity.
     */
    public VerificationResponse verifyDownload(VerificationRequest request) {
        logger.info("Verifying download: {}", request.getFileName());

        VerificationResponse response = new VerificationResponse();
        response.setVerificationTime(Instant.now());

        try {
            Path filePath = Paths.get(downloadBasePath, request.getFileName());
            
            if (!Files.exists(filePath)) {
                throw new VerificationException("File not found: " + request.getFileName());
            }

            // Verify file size
            long actualFileSize = Files.size(filePath);
            response.setActualFileSize(actualFileSize);
            
            boolean fileSizeMatch = request.getFileSize() == null || 
                                  request.getFileSize().equals(actualFileSize);
            response.setFileSizeMatch(fileSizeMatch);

            // Verify checksum
            String actualChecksum = calculateChecksum(filePath, request.getAlgorithm());
            response.setActualChecksum(actualChecksum);
            
            boolean checksumMatch = request.getChecksum().equalsIgnoreCase(actualChecksum);
            response.setChecksumMatch(checksumMatch);

            // Overall validation
            response.setIsValid(fileSizeMatch && checksumMatch);

            logger.info("Download verification completed: {}, valid: {}", 
                       request.getFileName(), response.getIsValid());
            
            return response;

        } catch (Exception e) {
            logger.error("Failed to verify download: {}", request.getFileName(), e);
            throw new VerificationException("Download verification failed", e);
        }
    }

    /**
     * Create new download record.
     */
    private DownloadRecord createNewDownloadRecord(String version, String platform) {
        String fileName = generateFileName(version, platform);
        String downloadUrl = generateDownloadUrl(version, platform);
        
        DownloadRecord record = new DownloadRecord(fileName, version, platform, downloadUrl);
        return downloadRecordRepository.save(record);
    }

    /**
     * Download file with retry mechanism.
     */
    private Path downloadWithRetry(DownloadRecord record) throws IOException {
        Path downloadDir = Paths.get(downloadBasePath);
        Files.createDirectories(downloadDir);
        
        Path filePath = downloadDir.resolve(record.getFileName());
        
        // Check if file already exists and is valid
        if (Files.exists(filePath) && record.getIsVerified()) {
            logger.debug("Using cached file: {}", filePath);
            return filePath;
        }

        Exception lastException = null;
        
        for (int attempt = 1; attempt <= maxRetryAttempts; attempt++) {
            try {
                logger.debug("Download attempt {} for: {}", attempt, record.getDownloadUrl());
                
                downloadFile(record.getDownloadUrl(), filePath);
                
                // Calculate and store checksums
                String sha256 = calculateChecksum(filePath, "SHA256");
                String md5 = calculateChecksum(filePath, "MD5");
                long fileSize = Files.size(filePath);
                
                record.setChecksumSha256(sha256);
                record.setChecksumMd5(md5);
                record.setFileSize(fileSize);
                record.setIsVerified(true);
                record.setVerificationTime(Instant.now());
                
                logger.info("Download completed successfully: {}", record.getFileName());
                return filePath;
                
            } catch (Exception e) {
                lastException = e;
                logger.warn("Download attempt {} failed for: {}", attempt, record.getDownloadUrl(), e);
                
                if (attempt < maxRetryAttempts) {
                    try {
                        Thread.sleep(1000 * attempt); // Exponential backoff
                    } catch (InterruptedException ie) {
                        Thread.currentThread().interrupt();
                        throw new IOException("Download interrupted", ie);
                    }
                }
            }
        }
        
        throw new IOException("Download failed after " + maxRetryAttempts + " attempts", lastException);
    }

    /**
     * Download file from URL.
     */
    private void downloadFile(String downloadUrl, Path targetPath) throws IOException {
        URL url = new URL(downloadUrl);
        URLConnection connection = url.openConnection();
        
        // Configure HTTPS connection
        if (connection instanceof HttpsURLConnection) {
            HttpsURLConnection httpsConnection = (HttpsURLConnection) connection;
            httpsConnection.setConnectTimeout((int) downloadTimeout);
            httpsConnection.setReadTimeout((int) downloadTimeout);
            
            // Add authentication if available
            addAuthentication(httpsConnection);
        }
        
        try (InputStream inputStream = connection.getInputStream()) {
            Files.copy(inputStream, targetPath, StandardCopyOption.REPLACE_EXISTING);
        }
    }

    /**
     * Add authentication to HTTPS connection if credentials are available.
     */
    private void addAuthentication(HttpsURLConnection connection) {
        String username = System.getenv("MVNW_USERNAME");
        String password = System.getenv("MVNW_PASSWORD");
        
        if (username != null && password != null) {
            String auth = username + ":" + password;
            String encodedAuth = Base64.getEncoder().encodeToString(auth.getBytes());
            connection.setRequestProperty("Authorization", "Basic " + encodedAuth);
            logger.debug("Added basic authentication for download");
        }
    }

    /**
     * Calculate file checksum.
     */
    private String calculateChecksum(Path filePath, String algorithm) throws IOException {
        try (InputStream inputStream = Files.newInputStream(filePath)) {
            switch (algorithm.toUpperCase()) {
                case "SHA256":
                    return DigestUtils.sha256Hex(inputStream);
                case "MD5":
                    return DigestUtils.md5Hex(inputStream);
                case "SHA1":
                    return DigestUtils.sha1Hex(inputStream);
                default:
                    throw new IllegalArgumentException("Unsupported algorithm: " + algorithm);
            }
        }
    }

    /**
     * Verify file integrity against stored checksums.
     */
    private void verifyFileIntegrity(Path filePath, DownloadRecord record) throws IOException {
        if (record.getChecksumSha256() != null) {
            String actualSha256 = calculateChecksum(filePath, "SHA256");
            if (!record.getChecksumSha256().equalsIgnoreCase(actualSha256)) {
                throw new VerificationException("SHA256 checksum mismatch for file: " + record.getFileName());
            }
        }
        
        if (record.getFileSize() != null) {
            long actualSize = Files.size(filePath);
            if (!record.getFileSize().equals(actualSize)) {
                throw new VerificationException("File size mismatch for file: " + record.getFileName());
            }
        }
        
        logger.debug("File integrity verification passed: {}", record.getFileName());
    }

    /**
     * Generate download URL for Maven wrapper.
     */
    private String generateDownloadUrl(String version, String platform) {
        // For Maven wrapper, the platform doesn't affect the download URL
        // The wrapper script handles platform-specific behavior
        return String.format("%s/%s/apache-maven-%s-bin.zip", defaultDownloadUrl, version, version);
    }

    /**
     * Generate file name for Maven wrapper.
     */
    private String generateFileName(String version, String platform) {
        return String.format("apache-maven-%s-bin.zip", version);
    }

    /**
     * Get download statistics.
     */
    @Cacheable(value = "download-stats")
    public Object getDownloadStatistics() {
        // Implementation for download statistics
        return downloadRecordRepository.getTotalDownloadCount();
    }
}