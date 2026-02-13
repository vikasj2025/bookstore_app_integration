package com.buildenvironment.dto;

import com.buildenvironment.entity.InstalledTool;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

import java.util.Map;

/**
 * DTO for build tool configuration.
 */
public class BuildToolConfigDto {

    @NotNull(message = "Tool type is required")
    private InstalledTool.ToolType toolType;

    @NotBlank(message = "Version is required")
    private String version;

    private String installationPath;

    private Map<String, Object> configuration;

    // Constructors
    public BuildToolConfigDto() {}

    public BuildToolConfigDto(InstalledTool.ToolType toolType, String version) {
        this.toolType = toolType;
        this.version = version;
    }

    // Getters and Setters
    public InstalledTool.ToolType getToolType() {
        return toolType;
    }

    public void setToolType(InstalledTool.ToolType toolType) {
        this.toolType = toolType;
    }

    public String getVersion() {
        return version;
    }

    public void setVersion(String version) {
        this.version = version;
    }

    public String getInstallationPath() {
        return installationPath;
    }

    public void setInstallationPath(String installationPath) {
        this.installationPath = installationPath;
    }

    public Map<String, Object> getConfiguration() {
        return configuration;
    }

    public void setConfiguration(Map<String, Object> configuration) {
        this.configuration = configuration;
    }

    @Override
    public String toString() {
        return "BuildToolConfigDto{" +
                "toolType=" + toolType +
                ", version='" + version + '\'' +
                ", installationPath='" + installationPath + '\'' +
                ", configuration=" + configuration +
                '}';
    }
}