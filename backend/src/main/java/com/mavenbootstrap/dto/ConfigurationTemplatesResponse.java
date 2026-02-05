package com.mavenbootstrap.dto;

import java.util.List;
import java.util.Map;

/**
 * DTO for configuration templates response.
 */
public class ConfigurationTemplatesResponse {

    private List<Map<String, Object>> templates;
    private Integer totalCount;

    // Constructors
    public ConfigurationTemplatesResponse() {}

    public ConfigurationTemplatesResponse(List<Map<String, Object>> templates, Integer totalCount) {
        this.templates = templates;
        this.totalCount = totalCount;
    }

    // Getters and Setters
    public List<Map<String, Object>> getTemplates() {
        return templates;
    }

    public void setTemplates(List<Map<String, Object>> templates) {
        this.templates = templates;
    }

    public Integer getTotalCount() {
        return totalCount;
    }

    public void setTotalCount(Integer totalCount) {
        this.totalCount = totalCount;
    }
}