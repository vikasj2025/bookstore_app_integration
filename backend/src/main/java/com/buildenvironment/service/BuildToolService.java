package com.buildenvironment.service;

import com.buildenvironment.dto.BuildToolConfigDto;
import com.buildenvironment.entity.BuildEnvironment;
import com.buildenvironment.entity.InstalledTool;
import com.buildenvironment.exception.ResourceNotFoundException;
import com.buildenvironment.repository.BuildEnvironmentRepository;
import com.buildenvironment.repository.InstalledToolRepository;
import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.*;

/**
 * Service for managing build tools.
 */
@Service
@Transactional
public class BuildToolService {

    private static final Logger logger = LoggerFactory.getLogger(BuildToolService.class);

    @Autowired
    private InstalledToolRepository installedToolRepository;

    @Autowired
    private BuildEnvironmentRepository buildEnvironmentRepository;

    @Autowired
    private ObjectMapper objectMapper;

    /**
     * Gets available versions for build tools.
     */
    @Cacheable(value = "buildToolVersions", key = "#toolType")
    public Map<String, List<Map<String, Object>>> getAvailableBuildToolVersions(InstalledTool.ToolType toolType) {
        logger.debug("Getting available versions for tool type: {}", toolType);
        
        Map<String, List<Map<String, Object>>> result = new HashMap<>();
        List<Map<String, Object>> versions = new ArrayList<>();
        
        // This would typically fetch from external APIs or repositories
        // For now, we'll return some sample data
        switch (toolType) {
            case MAVEN:
                versions.addAll(Arrays.asList(
                    createToolVersion("3.9.6", "2023-12-01", false, true),
                    createToolVersion("3.9.5", "2023-10-15", false, false),
                    createToolVersion("3.8.8", "2023-03-01", true, false),
                    createToolVersion("3.8.7", "2022-12-15", true, false)
                ));
                break;
            case GRADLE:
                versions.addAll(Arrays.asList(
                    createToolVersion("8.5", "2023-11-15", false, true),
                    createToolVersion("8.4", "2023-10-01", false, false),
                    createToolVersion("7.6.4", "2023-08-15", true, false)
                ));
                break;
            case JAVA:
                versions.addAll(Arrays.asList(
                    createToolVersion("21.0.1", "2023-10-17", true, false),
                    createToolVersion("17.0.9", "2023-10-17", true, false),
                    createToolVersion("11.0.21", "2023-10-17", true, false),
                    createToolVersion("22-ea", "2024-01-01", false, true)
                ));
                break;
            case NODEJS:
                versions.addAll(Arrays.asList(
                    createToolVersion("20.10.0", "2023-11-22", true, false),
                    createToolVersion("21.4.0", "2023-11-30", false, true),
                    createToolVersion("18.19.0", "2023-11-29", true, false)
                ));
                break;
            case NPM:
                versions.addAll(Arrays.asList(
                    createToolVersion("10.2.4", "2023-11-15", false, true),
                    createToolVersion("9.8.1", "2023-08-15", false, false)
                ));
                break;
            case DOCKER:
                versions.addAll(Arrays.asList(
                    createToolVersion("24.0.7", "2023-10-30", false, true),
                    createToolVersion("24.0.6", "2023-09-15", false, false),
                    createToolVersion("23.0.6", "2023-07-01", false, false)
                ));
                break;
        }
        
        if (toolType != null) {
            result.put(toolType.name().toLowerCase(), versions);
        } else {
            // Return all tool types
            for (InstalledTool.ToolType type : InstalledTool.ToolType.values()) {
                result.put(type.name().toLowerCase(), getAvailableBuildToolVersions(type).get(type.name().toLowerCase()));
            }
        }
        
        return result;
    }

    /**
     * Installs a build tool in the specified environment.
     */
    public InstalledTool installBuildTool(UUID environmentId, BuildToolConfigDto toolConfig, String userId) {
        logger.info("Installing build tool {} version {} in environment {}", 
                   toolConfig.getToolType(), toolConfig.getVersion(), environmentId);

        BuildEnvironment environment = buildEnvironmentRepository.findById(environmentId)
                .orElseThrow(() -> new ResourceNotFoundException("Build environment not found: " + environmentId));

        // Check if tool version is already installed
        if (installedToolRepository.existsByEnvironmentAndToolTypeAndVersion(
                environmentId, toolConfig.getToolType(), toolConfig.getVersion())) {
            throw new IllegalArgumentException(
                String.format("Tool %s version %s is already installed in environment %s", 
                            toolConfig.getToolType(), toolConfig.getVersion(), environment.getEnvironmentName()));
        }

        // Create installed tool record
        InstalledTool installedTool = new InstalledTool(environment, toolConfig.getToolType(), toolConfig.getVersion());
        installedTool.setInstallationPath(toolConfig.getInstallationPath());
        installedTool.setStatus(InstalledTool.ToolStatus.ACTIVE);
        
        // Set configuration if provided
        if (toolConfig.getConfiguration() != null) {
            try {
                installedTool.setConfiguration(objectMapper.writeValueAsString(toolConfig.getConfiguration()));
            } catch (JsonProcessingException e) {
                logger.warn("Failed to serialize tool configuration", e);
            }
        }

        // Check if this should be the default tool for this type
        Optional<InstalledTool> existingDefault = installedToolRepository
                .findByBuildEnvironment_EnvironmentIdAndToolTypeAndIsDefaultTrue(
                        environmentId, toolConfig.getToolType());
        
        if (existingDefault.isEmpty()) {
            // No default tool exists, make this one the default
            installedTool.setIsDefault(true);
        }

        installedTool = installedToolRepository.save(installedTool);
        
        logger.info("Successfully installed build tool {} version {} with ID {}", 
                   toolConfig.getToolType(), toolConfig.getVersion(), installedTool.getToolId());

        return installedTool;
    }

    /**
     * Gets installed tools for an environment.
     */
    public List<InstalledTool> getInstalledTools(UUID environmentId) {
        return installedToolRepository.findByBuildEnvironment_EnvironmentId(environmentId);
    }

    /**
     * Gets installed tools by type for an environment.
     */
    public List<InstalledTool> getInstalledToolsByType(UUID environmentId, InstalledTool.ToolType toolType) {
        return installedToolRepository.findByBuildEnvironment_EnvironmentIdAndToolType(environmentId, toolType);
    }

    /**
     * Gets the default tool of a specific type in an environment.
     */
    public Optional<InstalledTool> getDefaultTool(UUID environmentId, InstalledTool.ToolType toolType) {
        return installedToolRepository.findByBuildEnvironment_EnvironmentIdAndToolTypeAndIsDefaultTrue(
                environmentId, toolType);
    }

    /**
     * Sets a tool as the default for its type.
     */
    public void setAsDefaultTool(UUID toolId, String userId) {
        InstalledTool tool = installedToolRepository.findById(toolId)
                .orElseThrow(() -> new ResourceNotFoundException("Installed tool not found: " + toolId));

        // Remove default flag from other tools of the same type
        List<InstalledTool> sameTypeTools = installedToolRepository
                .findByBuildEnvironment_EnvironmentIdAndToolType(
                        tool.getBuildEnvironment().getEnvironmentId(), tool.getToolType());
        
        for (InstalledTool existingTool : sameTypeTools) {
            if (!existingTool.getToolId().equals(toolId)) {
                existingTool.setIsDefault(false);
                installedToolRepository.save(existingTool);
            }
        }

        // Set this tool as default
        tool.setIsDefault(true);
        installedToolRepository.save(tool);
        
        logger.info("Set tool {} as default for type {} in environment {}", 
                   toolId, tool.getToolType(), tool.getBuildEnvironment().getEnvironmentId());
    }

    /**
     * Removes an installed tool.
     */
    public void removeInstalledTool(UUID toolId, String userId) {
        InstalledTool tool = installedToolRepository.findById(toolId)
                .orElseThrow(() -> new ResourceNotFoundException("Installed tool not found: " + toolId));

        logger.info("Removing installed tool {} from environment {}", 
                   toolId, tool.getBuildEnvironment().getEnvironmentId());

        installedToolRepository.delete(tool);
    }

    private Map<String, Object> createToolVersion(String version, String releaseDate, boolean isLts, boolean isLatest) {
        Map<String, Object> toolVersion = new HashMap<>();
        toolVersion.put("version", version);
        toolVersion.put("releaseDate", releaseDate);
        toolVersion.put("isLts", isLts);
        toolVersion.put("isLatest", isLatest);
        toolVersion.put("downloadUrl", "https://example.com/download/" + version);
        toolVersion.put("checksum", "sha256:" + UUID.randomUUID().toString().replace("-", ""));
        return toolVersion;
    }
}