package com.buildenvironment.controller;

import com.buildenvironment.dto.MavenWrapperDownloadRequest;
import com.buildenvironment.dto.MavenWrapperDownloadResponse;
import com.buildenvironment.entity.MavenWrapperDownload;
import com.buildenvironment.exception.ResourceNotFoundException;
import com.buildenvironment.service.MavenWrapperService;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;

import java.time.LocalDateTime;
import java.util.UUID;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@WebMvcTest(MavenWrapperController.class)
class MavenWrapperControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockBean
    private MavenWrapperService mavenWrapperService;

    @Autowired
    private ObjectMapper objectMapper;

    private MavenWrapperDownloadRequest request;
    private MavenWrapperDownloadResponse response;
    private MavenWrapperDownload download;
    private UUID downloadId;

    @BeforeEach
    void setUp() {
        downloadId = UUID.randomUUID();
        
        request = new MavenWrapperDownloadRequest();
        request.setProjectPath("/test/project");
        request.setMavenVersion("3.9.6");
        request.setForceDownload(false);
        
        response = new MavenWrapperDownloadResponse();
        response.setDownloadId(downloadId);
        response.setStatus(MavenWrapperDownload.DownloadStatus.INITIATED);
        response.setMessage("Maven Wrapper download has been initiated");
        response.setEstimatedCompletionTime(LocalDateTime.now().plusMinutes(5));
        
        download = new MavenWrapperDownload();
        download.setDownloadId(downloadId);
        download.setProjectPath("/test/project");
        download.setMavenVersion("3.9.6");
        download.setStatus(MavenWrapperDownload.DownloadStatus.INITIATED);
        download.setProgress(0);
    }

    @Test
    void downloadMavenWrapper_ShouldReturnSuccess_WhenValidRequest() throws Exception {
        // Given
        when(mavenWrapperService.downloadMavenWrapper(any(MavenWrapperDownloadRequest.class)))
            .thenReturn(response);

        // When & Then
        mockMvc.perform(post("/api/v1/maven-wrapper/download")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request)))
            .andExpect(status().isOk())
            .andExpect(content().contentType(MediaType.APPLICATION_JSON))
            .andExpect(jsonPath("$.downloadId").value(downloadId.toString()))
            .andExpect(jsonPath("$.status").value("INITIATED"))
            .andExpect(jsonPath("$.message").exists());
    }

    @Test
    void downloadMavenWrapper_ShouldReturnBadRequest_WhenInvalidRequest() throws Exception {
        // Given
        MavenWrapperDownloadRequest invalidRequest = new MavenWrapperDownloadRequest();
        // Missing required fields

        // When & Then
        mockMvc.perform(post("/api/v1/maven-wrapper/download")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(invalidRequest)))
            .andExpected(status().isBadRequest());
    }

    @Test
    void downloadMavenWrapper_ShouldReturnConflict_WhenDownloadAlreadyInProgress() throws Exception {
        // Given
        when(mavenWrapperService.downloadMavenWrapper(any(MavenWrapperDownloadRequest.class)))
            .thenThrow(new IllegalStateException("Download already in progress"));

        // When & Then
        mockMvc.perform(post("/api/v1/maven-wrapper/download")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request)))
            .andExpect(status().isConflict());
    }

    @Test
    void getMavenWrapperStatus_ShouldReturnStatus_WhenDownloadExists() throws Exception {
        // Given
        when(mavenWrapperService.getMavenWrapperStatus(downloadId))
            .thenReturn(download);

        // When & Then
        mockMvc.perform(get("/api/v1/maven-wrapper/status/{downloadId}", downloadId))
            .andExpect(status().isOk())
            .andExpect(content().contentType(MediaType.APPLICATION_JSON))
            .andExpect(jsonPath("$.downloadId").value(downloadId.toString()))
            .andExpect(jsonPath("$.projectPath").value("/test/project"))
            .andExpect(jsonPath("$.mavenVersion").value("3.9.6"))
            .andExpect(jsonPath("$.status").value("INITIATED"))
            .andExpect(jsonPath("$.progress").value(0));
    }

    @Test
    void getMavenWrapperStatus_ShouldReturnNotFound_WhenDownloadDoesNotExist() throws Exception {
        // Given
        when(mavenWrapperService.getMavenWrapperStatus(downloadId))
            .thenThrow(new ResourceNotFoundException("Download operation not found"));

        // When & Then
        mockMvc.perform(get("/api/v1/maven-wrapper/status/{downloadId}", downloadId))
            .andExpect(status().isNotFound());
    }

    @Test
    void downloadMavenWrapper_ShouldValidateMavenVersion_WhenInvalidFormat() throws Exception {
        // Given
        request.setMavenVersion("invalid-version");

        // When & Then
        mockMvc.perform(post("/api/v1/maven-wrapper/download")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request)))
            .andExpect(status().isBadRequest())
            .andExpect(jsonPath("$.validationErrors").exists())
            .andExpect(jsonPath("$.validationErrors[0].field").value("mavenVersion"));
    }

    @Test
    void downloadMavenWrapper_ShouldAcceptCustomRepositoryUrl_WhenProvided() throws Exception {
        // Given
        request.setRepositoryUrl("https://custom.repo.com/maven2");
        when(mavenWrapperService.downloadMavenWrapper(any(MavenWrapperDownloadRequest.class)))
            .thenReturn(response);

        // When & Then
        mockMvc.perform(post("/api/v1/maven-wrapper/download")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request)))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.downloadId").value(downloadId.toString()));
    }
}