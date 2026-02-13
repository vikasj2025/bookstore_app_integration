package com.buildenvironment.controller;

import com.buildenvironment.dto.MavenWrapperDownloadRequest;
import com.buildenvironment.dto.MavenWrapperDownloadResponse;
import com.buildenvironment.entity.MavenWrapperDownload;
import com.buildenvironment.service.MavenWrapperService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

/**
 * REST controller for Maven Wrapper operations.
 */
@RestController
@RequestMapping("/api/v1/maven-wrapper")
@Tag(name = "Maven Wrapper", description = "Operations related to Maven Wrapper auto-download and management")
public class MavenWrapperController {

    private static final Logger logger = LoggerFactory.getLogger(MavenWrapperController.class);

    @Autowired
    private MavenWrapperService mavenWrapperService;

    @Operation(
        summary = "Auto-download Maven Wrapper",
        description = "Automatically downloads and configures Maven Wrapper for specified project"
    )
    @ApiResponses(value = {
        @ApiResponse(
            responseCode = "200", 
            description = "Maven Wrapper download initiated successfully",
            content = @Content(schema = @Schema(implementation = MavenWrapperDownloadResponse.class))
        ),
        @ApiResponse(
            responseCode = "400", 
            description = "Invalid request parameters"
        ),
        @ApiResponse(
            responseCode = "401", 
            description = "Unauthorized access"
        ),
        @ApiResponse(
            responseCode = "500", 
            description = "Internal server error"
        )
    })
    @PostMapping("/download")
    public ResponseEntity<MavenWrapperDownloadResponse> downloadMavenWrapper(
            @Valid @RequestBody MavenWrapperDownloadRequest request) {
        
        logger.info("Received Maven Wrapper download request for project: {}", request.getProjectPath());
        
        try {
            MavenWrapperDownloadResponse response = mavenWrapperService.downloadMavenWrapper(request);
            return ResponseEntity.ok(response);
        } catch (IllegalStateException e) {
            logger.warn("Maven Wrapper download conflict: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.CONFLICT).build();
        } catch (Exception e) {
            logger.error("Failed to initiate Maven Wrapper download", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    @Operation(
        summary = "Get Maven Wrapper download status",
        description = "Retrieves the current status of Maven Wrapper download operation"
    )
    @ApiResponses(value = {
        @ApiResponse(
            responseCode = "200", 
            description = "Status retrieved successfully",
            content = @Content(schema = @Schema(implementation = MavenWrapperDownload.class))
        ),
        @ApiResponse(
            responseCode = "404", 
            description = "Download operation not found"
        ),
        @ApiResponse(
            responseCode = "500", 
            description = "Internal server error"
        )
    })
    @GetMapping("/status/{downloadId}")
    public ResponseEntity<MavenWrapperDownload> getMavenWrapperStatus(
            @Parameter(description = "Download operation ID", required = true)
            @PathVariable UUID downloadId) {
        
        logger.debug("Getting Maven Wrapper download status for ID: {}", downloadId);
        
        try {
            MavenWrapperDownload status = mavenWrapperService.getMavenWrapperStatus(downloadId);
            return ResponseEntity.ok(status);
        } catch (Exception e) {
            logger.error("Failed to get Maven Wrapper download status for ID: {}", downloadId, e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }
}