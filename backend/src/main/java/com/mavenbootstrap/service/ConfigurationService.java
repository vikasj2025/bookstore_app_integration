package com.mavenbootstrap.service;

import com.mavenbootstrap.dto.ConfigDiscoveryRequest;
import com.mavenbootstrap.dto.ConfigDiscoveryResponse;
import com.mavenbootstrap.dto.ConfigurationTemplatesResponse;
import com.mavenbootstrap.entity.ConfigurationTemplate;
import com.mavenbootstrap.repository.ConfigurationTemplateRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.io.File;
import java.io.FileInputStream;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.*;
import java.util.stream.Stream;

/**
 * Service for managing Maven configuration discovery and templates.
 */
@Service
@Transactional(readOnly = true)
public class ConfigurationService {

    private static final Logger logger = LoggerFactory.getLogger(ConfigurationService.class);
    
    private static final String POM_XML = "pom.xml";
    private static final String MAVEN_WRAPPER_PROPERTIES = ".mvn/wrapper/maven-wrapper.properties";
    private static final String MAVEN_WRAPPER_JAR = ".mvn/wrapper/maven-wrapper.jar";

    @Autowired
    private ConfigurationTemplateRepository templateRepository;

    /**
     * Discover project configuration from the given project path.
     */
    public ConfigDiscoveryResponse discoverProjectConfiguration(String projectPath, 
                                                              Integer scanDepth, 
                                                              Boolean includeSubmodules) {
        logger.info("Discovering configuration for project: {}", projectPath);
        
        ConfigDiscoveryResponse response = new ConfigDiscoveryResponse();
        
        try {
            Path rootPath = Paths.get(projectPath);
            if (!Files.exists(rootPath)) {
                throw new IllegalArgumentException("Project path does not exist: " + projectPath);
            }

            // Detect project type
            String projectType = detectProjectType(rootPath);
            response.setProjectType(projectType);
            logger.debug("Detected project type: {}", projectType);

            // Detect Maven version
            String mavenVersion = detectMavenVersion(rootPath);
            response.setDetectedMavenVersion(mavenVersion);
            logger.debug("Detected Maven version: {}", mavenVersion);

            // Get recommended configuration
            Map<String, Object> recommendedConfig = getRecommendedConfiguration(projectType, mavenVersion);
            response.setRecommendedConfiguration(recommendedConfig);

            // Discover submodules if requested
            if (includeSubmodules != null && includeSubmodules) {
                List<Map<String, Object>> submodules = discoverSubmodules(rootPath, scanDepth != null ? scanDepth : 3);
                response.setSubmodules(submodules);
                logger.debug("Discovered {} submodules", submodules.size());
            }

            // Detect dependencies
            List<Map<String, Object>> dependencies = detectDependencies(rootPath);
            response.setDetectedDependencies(dependencies);
            logger.debug("Detected {} dependencies", dependencies.size());

            logger.info("Configuration discovery completed for project: {}", projectPath);
            return response;

        } catch (Exception e) {
            logger.error("Failed to discover configuration for project: {}", projectPath, e);
            throw new RuntimeException("Configuration discovery failed", e);
        }
    }

    /**
     * Get configuration templates with optional filters.
     */
    @Cacheable(value = "configuration-templates", key = "#projectType + '_' + #mavenVersion")
    public ConfigurationTemplatesResponse getConfigurationTemplates(String projectType, String mavenVersion) {
        logger.debug("Getting configuration templates for type: {}, version: {}", projectType, mavenVersion);
        
        List<ConfigurationTemplate> templates = templateRepository.findTemplatesWithFilters(projectType, mavenVersion);
        
        ConfigurationTemplatesResponse response = new ConfigurationTemplatesResponse();
        response.setTemplates(convertTemplatesToDto(templates));
        response.setTotalCount(templates.size());
        
        logger.debug("Found {} configuration templates", templates.size());
        return response;
    }

    /**
     * Detect project type based on project structure and dependencies.
     */
    private String detectProjectType(Path projectPath) {
        try {
            Path pomPath = projectPath.resolve(POM_XML);
            if (!Files.exists(pomPath)) {
                return "library"; // Default fallback
            }

            String pomContent = Files.readString(pomPath);
            
            // Check for Spring Boot
            if (pomContent.contains("spring-boot-starter") || 
                pomContent.contains("org.springframework.boot")) {
                return "spring-boot";
            }
            
            // Check for web application
            if (pomContent.contains("javax.servlet") || 
                pomContent.contains("jakarta.servlet") ||
                pomContent.contains("spring-web")) {
                return "web-app";
            }
            
            // Check for microservice indicators
            if (pomContent.contains("spring-cloud") ||
                pomContent.contains("eureka") ||
                pomContent.contains("consul")) {
                return "microservice";
            }
            
            return "library";
            
        } catch (IOException e) {
            logger.warn("Failed to read pom.xml for project type detection: {}", e.getMessage());
            return "library";
        }
    }

    /**
     * Detect Maven version from wrapper properties or pom.xml.
     */
    private String detectMavenVersion(Path projectPath) {
        // First try to read from maven-wrapper.properties
        Path wrapperPropsPath = projectPath.resolve(MAVEN_WRAPPER_PROPERTIES);
        if (Files.exists(wrapperPropsPath)) {
            try {
                Properties props = new Properties();
                props.load(Files.newInputStream(wrapperPropsPath));
                String distributionUrl = props.getProperty("distributionUrl");
                if (distributionUrl != null) {
                    return extractVersionFromUrl(distributionUrl);
                }
            } catch (IOException e) {
                logger.warn("Failed to read maven-wrapper.properties: {}", e.getMessage());
            }
        }

        // Try to read from pom.xml maven.version property
        Path pomPath = projectPath.resolve(POM_XML);
        if (Files.exists(pomPath)) {
            try {
                String pomContent = Files.readString(pomPath);
                String version = extractMavenVersionFromPom(pomContent);
                if (version != null) {
                    return version;
                }
            } catch (IOException e) {
                logger.warn("Failed to read pom.xml for Maven version: {}", e.getMessage());
            }
        }

        // Default version
        return "3.9.5";
    }

    /**
     * Extract Maven version from distribution URL.
     */
    private String extractVersionFromUrl(String distributionUrl) {
        // Example: https://repo.maven.apache.org/maven2/org/apache/maven/apache-maven/3.9.5/apache-maven-3.9.5-bin.zip
        String[] parts = distributionUrl.split("/");
        for (int i = 0; i < parts.length - 1; i++) {
            if ("apache-maven".equals(parts[i]) && i + 1 < parts.length) {
                String version = parts[i + 1];
                if (version.matches("^[0-9]+\\.[0-9]+\\.[0-9]+$")) {
                    return version;
                }
            }
        }
        return null;
    }

    /**
     * Extract Maven version from pom.xml content.
     */
    private String extractMavenVersionFromPom(String pomContent) {
        // Look for maven.version property
        String pattern = "<maven\\.version>([^<]+)</maven\\.version>";
        java.util.regex.Pattern p = java.util.regex.Pattern.compile(pattern);
        java.util.regex.Matcher m = p.matcher(pomContent);
        if (m.find()) {
            return m.group(1);
        }
        return null;
    }

    /**
     * Get recommended configuration for project type and Maven version.
     */
    private Map<String, Object> getRecommendedConfiguration(String projectType, String mavenVersion) {
        List<ConfigurationTemplate> templates = templateRepository
            .findByProjectTypeAndMavenVersionAndIsActiveTrue(projectType, mavenVersion);
        
        if (!templates.isEmpty()) {
            return templates.get(0).getConfiguration();
        }
        
        // Fallback to any template for the project type
        templates = templateRepository.findByProjectTypeAndIsActiveTrue(projectType);
        if (!templates.isEmpty()) {
            return templates.get(0).getConfiguration();
        }
        
        // Default configuration
        return createDefaultConfiguration(projectType, mavenVersion);
    }

    /**
     * Create default configuration.
     */
    private Map<String, Object> createDefaultConfiguration(String projectType, String mavenVersion) {
        Map<String, Object> config = new HashMap<>();
        config.put("mavenVersion", mavenVersion);
        config.put("javaVersion", "17");
        
        Map<String, String> properties = new HashMap<>();
        properties.put("maven.compiler.source", "17");
        properties.put("maven.compiler.target", "17");
        properties.put("project.build.sourceEncoding", "UTF-8");
        config.put("properties", properties);
        
        List<Map<String, String>> repositories = new ArrayList<>();
        Map<String, String> central = new HashMap<>();
        central.put("id", "central");
        central.put("url", "https://repo.maven.apache.org/maven2");
        central.put("name", "Maven Central");
        repositories.add(central);
        config.put("repositories", repositories);
        
        return config;
    }

    /**
     * Discover submodules in the project.
     */
    private List<Map<String, Object>> discoverSubmodules(Path rootPath, int maxDepth) {
        List<Map<String, Object>> submodules = new ArrayList<>();
        
        try (Stream<Path> paths = Files.walk(rootPath, maxDepth)) {
            paths.filter(path -> path.getFileName().toString().equals(POM_XML))
                 .filter(path -> !path.equals(rootPath.resolve(POM_XML)))
                 .forEach(pomPath -> {
                     Map<String, Object> submodule = extractSubmoduleInfo(pomPath);
                     if (submodule != null) {
                         submodules.add(submodule);
                     }
                 });
        } catch (IOException e) {
            logger.warn("Failed to discover submodules: {}", e.getMessage());
        }
        
        return submodules;
    }

    /**
     * Extract submodule information from pom.xml.
     */
    private Map<String, Object> extractSubmoduleInfo(Path pomPath) {
        try {
            String pomContent = Files.readString(pomPath);
            Map<String, Object> submodule = new HashMap<>();
            
            String artifactId = extractXmlValue(pomContent, "artifactId");
            String groupId = extractXmlValue(pomContent, "groupId");
            
            submodule.put("name", pomPath.getParent().getFileName().toString());
            submodule.put("path", pomPath.getParent().toString());
            submodule.put("artifactId", artifactId);
            submodule.put("groupId", groupId);
            
            return submodule;
            
        } catch (IOException e) {
            logger.warn("Failed to extract submodule info from: {}", pomPath, e);
            return null;
        }
    }

    /**
     * Detect dependencies from pom.xml.
     */
    private List<Map<String, Object>> detectDependencies(Path projectPath) {
        List<Map<String, Object>> dependencies = new ArrayList<>();
        
        Path pomPath = projectPath.resolve(POM_XML);
        if (!Files.exists(pomPath)) {
            return dependencies;
        }
        
        try {
            String pomContent = Files.readString(pomPath);
            // Simple regex to extract dependencies - in production, use proper XML parser
            String dependencyPattern = "<dependency>.*?<groupId>([^<]+)</groupId>.*?<artifactId>([^<]+)</artifactId>.*?(?:<version>([^<]+)</version>)?.*?(?:<scope>([^<]+)</scope>)?.*?</dependency>";
            java.util.regex.Pattern pattern = java.util.regex.Pattern.compile(dependencyPattern, java.util.regex.Pattern.DOTALL);
            java.util.regex.Matcher matcher = pattern.matcher(pomContent);
            
            while (matcher.find()) {
                Map<String, Object> dependency = new HashMap<>();
                dependency.put("groupId", matcher.group(1));
                dependency.put("artifactId", matcher.group(2));
                dependency.put("version", matcher.group(3) != null ? matcher.group(3) : "unknown");
                dependency.put("scope", matcher.group(4) != null ? matcher.group(4) : "compile");
                dependencies.add(dependency);
            }
            
        } catch (IOException e) {
            logger.warn("Failed to detect dependencies: {}", e.getMessage());
        }
        
        return dependencies;
    }

    /**
     * Extract XML value using simple regex.
     */
    private String extractXmlValue(String xml, String tagName) {
        String pattern = "<" + tagName + ">([^<]+)</" + tagName + ">";
        java.util.regex.Pattern p = java.util.regex.Pattern.compile(pattern);
        java.util.regex.Matcher m = p.matcher(xml);
        return m.find() ? m.group(1) : null;
    }

    /**
     * Convert templates to DTO format.
     */
    private List<Map<String, Object>> convertTemplatesToDto(List<ConfigurationTemplate> templates) {
        return templates.stream().map(template -> {
            Map<String, Object> dto = new HashMap<>();
            dto.put("id", template.getId().toString());
            dto.put("name", template.getName());
            dto.put("description", template.getDescription());
            dto.put("projectType", template.getProjectType());
            dto.put("mavenVersion", template.getMavenVersion());
            dto.put("configuration", template.getConfiguration());
            return dto;
        }).toList();
    }
}