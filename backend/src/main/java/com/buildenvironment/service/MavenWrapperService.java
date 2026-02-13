package com.buildenvironment.service;

import com.buildenvironment.dto.MavenWrapperDownloadRequest;
import com.buildenvironment.dto.MavenWrapperDownloadResponse;
import com.buildenvironment.entity.MavenWrapperDownload;
import com.buildenvironment.exception.ResourceNotFoundException;
import com.buildenvironment.repository.MavenWrapperDownloadRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.io.File;
import java.io.FileOutputStream;
import java.io.IOException;
import java.net.URL;
import java.nio.channels.Channels;
import java.nio.channels.ReadableByteChannel;
import java.time.LocalDateTime;
import java.util.Arrays;
import java.util.Properties;
import java.util.UUID;
import java.util.concurrent.CompletableFuture;

/**
 * Service for handling Maven Wrapper download operations.
 */
@Service
@Transactional
public class MavenWrapperService {

    private static final Logger logger = LoggerFactory.getLogger(MavenWrapperService.class);
    
    private static final String DEFAULT_DOWNLOAD_URL = "https://repo.maven.apache.org/maven2/org/apache/maven/wrapper/maven-wrapper/";
    private static final String MAVEN_WRAPPER_PROPERTIES_PATH = ".mvn/wrapper/maven-wrapper.properties";
    private static final String MAVEN_WRAPPER_JAR_PATH = ".mvn/wrapper/maven-wrapper.jar";
    private static final String PROPERTY_NAME_WRAPPER_URL = "wrapperUrl";

    @Autowired
    private MavenWrapperDownloadRepository downloadRepository;

    /**
     * Initiates Maven Wrapper download process.
     */
    public MavenWrapperDownloadResponse downloadMavenWrapper(MavenWrapperDownloadRequest request) {
        logger.info("Initiating Maven Wrapper download for project: {}, version: {}", 
                   request.getProjectPath(), request.getMavenVersion());

        // Check if there's already an active download for this project
        if (!request.getForceDownload() && 
            downloadRepository.hasActiveDownloadForProject(request.getProjectPath())) {
            throw new IllegalStateException("Maven Wrapper download already in progress for project: " + request.getProjectPath());
        }

        // Create download record
        MavenWrapperDownload download = new MavenWrapperDownload(request.getProjectPath(), request.getMavenVersion());
        download.setRepositoryUrl(request.getRepositoryUrl());
        download.setForceDownload(request.getForceDownload());
        download.setEstimatedCompletionTime(LocalDateTime.now().plusMinutes(5)); // Estimate 5 minutes
        
        download = downloadRepository.save(download);

        // Start async download
        performDownloadAsync(download.getDownloadId());

        return MavenWrapperDownloadResponse.fromEntity(download);
    }

    /**
     * Gets the status of a Maven Wrapper download operation.
     */
    public MavenWrapperDownload getMavenWrapperStatus(UUID downloadId) {
        return downloadRepository.findById(downloadId)
                .orElseThrow(() -> new ResourceNotFoundException("Download operation not found: " + downloadId));
    }

    /**
     * Performs the actual Maven Wrapper download asynchronously.
     */
    @Async
    public CompletableFuture<Void> performDownloadAsync(UUID downloadId) {
        MavenWrapperDownload download = downloadRepository.findById(downloadId)
                .orElseThrow(() -> new ResourceNotFoundException("Download operation not found: " + downloadId));

        try {
            logger.info("Starting Maven Wrapper download for ID: {}", downloadId);
            
            download.setStatus(MavenWrapperDownload.DownloadStatus.IN_PROGRESS);
            download.setProgress(10);
            downloadRepository.save(download);

            File baseDirectory = new File(download.getProjectPath());
            if (!baseDirectory.exists()) {
                throw new IOException("Project directory does not exist: " + download.getProjectPath());
            }

            // Determine download URL
            String downloadUrl = determineDownloadUrl(baseDirectory, download);
            
            download.setProgress(30);
            downloadRepository.save(download);

            // Create wrapper directory if it doesn't exist
            File wrapperDir = new File(baseDirectory, ".mvn/wrapper");
            if (!wrapperDir.exists() && !wrapperDir.mkdirs()) {
                throw new IOException("Failed to create wrapper directory: " + wrapperDir.getAbsolutePath());
            }

            download.setProgress(50);
            downloadRepository.save(download);

            // Download the wrapper jar
            File outputFile = new File(baseDirectory, MAVEN_WRAPPER_JAR_PATH);
            downloadFileFromURL(downloadUrl, outputFile);

            download.setProgress(90);
            download.getDownloadedFiles().add(outputFile.getAbsolutePath());
            downloadRepository.save(download);

            // Create or update properties file
            createWrapperProperties(baseDirectory, downloadUrl, download.getMavenVersion());

            download.setStatus(MavenWrapperDownload.DownloadStatus.COMPLETED);
            download.setProgress(100);
            download.setCompletionTime(LocalDateTime.now());
            download.getDownloadedFiles().add(new File(baseDirectory, MAVEN_WRAPPER_PROPERTIES_PATH).getAbsolutePath());
            downloadRepository.save(download);

            logger.info("Maven Wrapper download completed successfully for ID: {}", downloadId);

        } catch (Exception e) {
            logger.error("Maven Wrapper download failed for ID: {}", downloadId, e);
            
            download.setStatus(MavenWrapperDownload.DownloadStatus.FAILED);
            download.setErrorMessage(e.getMessage());
            download.setCompletionTime(LocalDateTime.now());
            downloadRepository.save(download);
        }

        return CompletableFuture.completedFuture(null);
    }

    private String determineDownloadUrl(File baseDirectory, MavenWrapperDownload download) throws IOException {
        File propertiesFile = new File(baseDirectory, MAVEN_WRAPPER_PROPERTIES_PATH);
        
        if (propertiesFile.exists() && !download.getForceDownload()) {
            Properties properties = new Properties();
            try (var fis = new java.io.FileInputStream(propertiesFile)) {
                properties.load(fis);
                String existingUrl = properties.getProperty(PROPERTY_NAME_WRAPPER_URL);
                if (existingUrl != null && !existingUrl.isEmpty()) {
                    return existingUrl;
                }
            }
        }

        // Use custom repository URL if provided
        if (download.getRepositoryUrl() != null && !download.getRepositoryUrl().isEmpty()) {
            return download.getRepositoryUrl() + "/org/apache/maven/wrapper/maven-wrapper/" + 
                   download.getMavenVersion() + "/maven-wrapper-" + download.getMavenVersion() + ".jar";
        }

        // Use default URL
        return DEFAULT_DOWNLOAD_URL + download.getMavenVersion() + "/maven-wrapper-" + download.getMavenVersion() + ".jar";
    }

    private void downloadFileFromURL(String urlString, File destination) throws IOException {
        logger.debug("Downloading from URL: {} to: {}", urlString, destination.getAbsolutePath());
        
        URL website = new URL(urlString);
        try (ReadableByteChannel rbc = Channels.newChannel(website.openStream());
             FileOutputStream fos = new FileOutputStream(destination)) {
            fos.getChannel().transferFrom(rbc, 0, Long.MAX_VALUE);
        }
    }

    private void createWrapperProperties(File baseDirectory, String downloadUrl, String mavenVersion) throws IOException {
        File propertiesFile = new File(baseDirectory, MAVEN_WRAPPER_PROPERTIES_PATH);
        Properties properties = new Properties();
        
        properties.setProperty(PROPERTY_NAME_WRAPPER_URL, downloadUrl);
        properties.setProperty("distributionUrl", 
            "https://repo.maven.apache.org/maven2/org/apache/maven/apache-maven/" + 
            mavenVersion + "/apache-maven-" + mavenVersion + "-bin.zip");
        
        try (var fos = new java.io.FileOutputStream(propertiesFile)) {
            properties.store(fos, "Maven Wrapper Properties");
        }
    }
}