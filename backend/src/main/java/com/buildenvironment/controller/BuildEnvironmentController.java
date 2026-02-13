package com.buildenvironment.controller;

import com.buildenvironment.dto.BuildEnvironmentConfigRequest;
import com.buildenvironment.entity.BuildEnvironment;
import com.buildenvironment.service.BuildEnvironmentService;
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
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

/**
 * REST controller for Build Environment operations.
 */
@RestController
@RequestMapping("/api/v1/build-environment")
@Tag(name = "Build Environment", description = "Build environment configuration and management operations")
public class BuildEnvironmentController {

    private static final Logger logger = LoggerFactory.getLogger(BuildEnvironmentController.class);

    @Autowired
    private BuildEnvironmentService buildEnvironmentService;

    @Operation(
        summary = "Configure build environment",
        description = "Automatically configures build environment with specified tools and settings"
    )
    @ApiResponses(value = {
        @ApiResponse(
            responseCode = "202", 
            description = "Configuration process initiated",
            content = @Content(schema = @Schema(implementation = BuildEnvironment.class))
        ),
        @ApiResponse(
            responseCode = "400", 
            description = "Invalid configuration parameters"
        ),
        @ApiResponse(
            responseCode = "401", 
            description = "Unauthorized access"
        ),
        @ApiResponse(
            responseCode = "409", 
            description = "Configuration conflict"
        ),
        @ApiResponse(
            responseCode = "500", 
            description = "Internal server error"
        )
    })
    @PostMapping("/configure")
    public ResponseEntity<BuildEnvironment> configureBuildEnvironment(
            @Valid @RequestBody BuildEnvironmentConfigRequest request,
            Authentication authentication) {
        
        logger.info("Received build environment configuration request for: {}", request.getEnvironmentName());
        
        try {
            String userId = authentication.getName();
            BuildEnvironment environment = buildEnvironmentService.configureBuildEnvironment(request, userId);
            return ResponseEntity.status(HttpStatus.ACCEPTED).body(environment);
        } catch (IllegalArgumentException e) {
            logger.warn("Build environment configuration conflict: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.CONFLICT).build();
        } catch (Exception e) {
            logger.error("Failed to configure build environment", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    @Operation(
        summary = "Get build environment details",
        description = "Retrieves detailed information about a specific build environment"
    )
    @ApiResponses(value = {
        @ApiResponse(
            responseCode = "200", 
            description = "Environment details retrieved successfully",
            content = @Content(schema = @Schema(implementation = BuildEnvironment.class))
        ),
        @ApiResponse(
            responseCode = "404", 
            description = "Environment not found"
        ),
        @ApiResponse(
            responseCode = "500", 
            description = "Internal server error"
        )
    })
    @GetMapping("/{environmentId}")
    public ResponseEntity<BuildEnvironment> getBuildEnvironment(
            @Parameter(description = "Build environment ID", required = true)
            @PathVariable UUID environmentId) {
        
        logger.debug("Getting build environment details for ID: {}", environmentId);
        
        try {
            BuildEnvironment environment = buildEnvironmentService.getBuildEnvironment(environmentId);
            return ResponseEntity.ok(environment);
        } catch (Exception e) {
            logger.error("Failed to get build environment for ID: {}", environmentId, e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    @Operation(
        summary = "Get all build environments",
        description = "Retrieves a list of all build environments"
    )
    @ApiResponses(value = {
        @ApiResponse(
            responseCode = "200", 
            description = "Environments retrieved successfully"
        ),
        @ApiResponse(
            responseCode = "500", 
            description = "Internal server error"
        )
    })
    @GetMapping
    public ResponseEntity<List<BuildEnvironment>> getAllBuildEnvironments() {
        
        logger.debug("Getting all build environments");
        
        try {
            List<BuildEnvironment> environments = buildEnvironmentService.getAllBuildEnvironments();
            return ResponseEntity.ok(environments);
        } catch (Exception e) {
            logger.error("Failed to get all build environments", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    @Operation(
        summary = "Delete build environment",
        description = "Removes build environment and cleans up resources"
    )
    @ApiResponses(value = {
        @ApiResponse(
            responseCode = "204", 
            description = "Environment deleted successfully"
        ),
        @ApiResponse(
            responseCode = "404", 
            description = "Environment not found"
        ),
        @ApiResponse(
            responseCode = "409", 
            description = "Cannot delete environment in current state"
        ),
        @ApiResponse(
            responseCode = "500", 
            description = "Internal server error"
        )
    })
    @DeleteMapping("/{environmentId}")
    public ResponseEntity<Void> deleteBuildEnvironment(
            @Parameter(description = "Build environment ID", required = true)
            @PathVariable UUID environmentId,
            Authentication authentication) {
        
        logger.info("Deleting build environment with ID: {}", environmentId);
        
        try {
            String userId = authentication.getName();
            buildEnvironmentService.deleteBuildEnvironment(environmentId, userId);
            return ResponseEntity.noContent().build();
        } catch (IllegalStateException e) {
            logger.warn("Cannot delete build environment: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.CONFLICT).build();
        } catch (Exception e) {
            logger.error("Failed to delete build environment for ID: {}", environmentId, e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }
}