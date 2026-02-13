package com.buildenvironment.service;

import com.buildenvironment.dto.MavenWrapperDownloadRequest;
import com.buildenvironment.dto.MavenWrapperDownloadResponse;
import com.buildenvironment.entity.MavenWrapperDownload;
import com.buildenvironment.exception.ResourceNotFoundException;
import com.buildenvironment.repository.MavenWrapperDownloadRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.Optional;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class MavenWrapperServiceTest {

    @Mock
    private MavenWrapperDownloadRepository downloadRepository;

    @InjectMocks
    private MavenWrapperService mavenWrapperService;

    private MavenWrapperDownloadRequest request;
    private MavenWrapperDownload download;
    private UUID downloadId;

    @BeforeEach
    void setUp() {
        downloadId = UUID.randomUUID();
        
        request = new MavenWrapperDownloadRequest();
        request.setProjectPath("/test/project");
        request.setMavenVersion("3.9.6");
        request.setForceDownload(false);
        
        download = new MavenWrapperDownload();
        download.setDownloadId(downloadId);
        download.setProjectPath("/test/project");
        download.setMavenVersion("3.9.6");
        download.setStatus(MavenWrapperDownload.DownloadStatus.INITIATED);
    }

    @Test
    void downloadMavenWrapper_ShouldInitiateDownload_WhenValidRequest() {
        // Given
        when(downloadRepository.hasActiveDownloadForProject(request.getProjectPath()))
            .thenReturn(false);
        when(downloadRepository.save(any(MavenWrapperDownload.class)))
            .thenReturn(download);

        // When
        MavenWrapperDownloadResponse response = mavenWrapperService.downloadMavenWrapper(request);

        // Then
        assertNotNull(response);
        assertEquals(downloadId, response.getDownloadId());
        assertEquals(MavenWrapperDownload.DownloadStatus.INITIATED, response.getStatus());
        
        verify(downloadRepository).hasActiveDownloadForProject(request.getProjectPath());
        verify(downloadRepository).save(any(MavenWrapperDownload.class));
    }

    @Test
    void downloadMavenWrapper_ShouldThrowException_WhenActiveDownloadExists() {
        // Given
        when(downloadRepository.hasActiveDownloadForProject(request.getProjectPath()))
            .thenReturn(true);

        // When & Then
        IllegalStateException exception = assertThrows(
            IllegalStateException.class,
            () -> mavenWrapperService.downloadMavenWrapper(request)
        );
        
        assertTrue(exception.getMessage().contains("already in progress"));
        verify(downloadRepository, never()).save(any());
    }

    @Test
    void downloadMavenWrapper_ShouldAllowDownload_WhenForceDownloadIsTrue() {
        // Given
        request.setForceDownload(true);
        when(downloadRepository.save(any(MavenWrapperDownload.class)))
            .thenReturn(download);

        // When
        MavenWrapperDownloadResponse response = mavenWrapperService.downloadMavenWrapper(request);

        // Then
        assertNotNull(response);
        assertEquals(downloadId, response.getDownloadId());
        
        verify(downloadRepository, never()).hasActiveDownloadForProject(anyString());
        verify(downloadRepository).save(any(MavenWrapperDownload.class));
    }

    @Test
    void getMavenWrapperStatus_ShouldReturnStatus_WhenDownloadExists() {
        // Given
        when(downloadRepository.findById(downloadId))
            .thenReturn(Optional.of(download));

        // When
        MavenWrapperDownload result = mavenWrapperService.getMavenWrapperStatus(downloadId);

        // Then
        assertNotNull(result);
        assertEquals(downloadId, result.getDownloadId());
        assertEquals("/test/project", result.getProjectPath());
        assertEquals("3.9.6", result.getMavenVersion());
        
        verify(downloadRepository).findById(downloadId);
    }

    @Test
    void getMavenWrapperStatus_ShouldThrowException_WhenDownloadNotFound() {
        // Given
        when(downloadRepository.findById(downloadId))
            .thenReturn(Optional.empty());

        // When & Then
        ResourceNotFoundException exception = assertThrows(
            ResourceNotFoundException.class,
            () -> mavenWrapperService.getMavenWrapperStatus(downloadId)
        );
        
        assertTrue(exception.getMessage().contains("not found"));
        verify(downloadRepository).findById(downloadId);
    }

    @Test
    void downloadMavenWrapper_ShouldSetCustomRepositoryUrl_WhenProvided() {
        // Given
        String customUrl = "https://custom.repo.com/maven2";
        request.setRepositoryUrl(customUrl);
        
        when(downloadRepository.hasActiveDownloadForProject(request.getProjectPath()))
            .thenReturn(false);
        when(downloadRepository.save(any(MavenWrapperDownload.class)))
            .thenAnswer(invocation -> {
                MavenWrapperDownload saved = invocation.getArgument(0);
                saved.setDownloadId(downloadId);
                return saved;
            });

        // When
        MavenWrapperDownloadResponse response = mavenWrapperService.downloadMavenWrapper(request);

        // Then
        assertNotNull(response);
        
        verify(downloadRepository).save(argThat(download -> 
            customUrl.equals(download.getRepositoryUrl())
        ));
    }
}