package com.mavenbootstrap.repository;

import com.mavenbootstrap.entity.ConfigurationTemplate;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

/**
 * Repository interface for ConfigurationTemplate entity.
 */
@Repository
public interface ConfigurationTemplateRepository extends JpaRepository<ConfigurationTemplate, UUID> {

    /**
     * Find active configuration templates by project type.
     */
    List<ConfigurationTemplate> findByProjectTypeAndIsActiveTrue(String projectType);

    /**
     * Find active configuration templates by Maven version.
     */
    List<ConfigurationTemplate> findByMavenVersionAndIsActiveTrue(String mavenVersion);

    /**
     * Find active configuration templates by project type and Maven version.
     */
    List<ConfigurationTemplate> findByProjectTypeAndMavenVersionAndIsActiveTrue(String projectType, String mavenVersion);

    /**
     * Find all active configuration templates.
     */
    List<ConfigurationTemplate> findByIsActiveTrueOrderByProjectTypeAscMavenVersionAsc();

    /**
     * Find configuration template by name.
     */
    Optional<ConfigurationTemplate> findByNameAndIsActiveTrue(String name);

    /**
     * Find configuration templates by project type with optional Maven version filter.
     */
    @Query("SELECT ct FROM ConfigurationTemplate ct WHERE ct.isActive = true " +
           "AND (:projectType IS NULL OR ct.projectType = :projectType) " +
           "AND (:mavenVersion IS NULL OR ct.mavenVersion = :mavenVersion) " +
           "ORDER BY ct.projectType ASC, ct.mavenVersion ASC")
    List<ConfigurationTemplate> findTemplatesWithFilters(@Param("projectType") String projectType, 
                                                        @Param("mavenVersion") String mavenVersion);

    /**
     * Get distinct project types from active templates.
     */
    @Query("SELECT DISTINCT ct.projectType FROM ConfigurationTemplate ct WHERE ct.isActive = true ORDER BY ct.projectType")
    List<String> findDistinctProjectTypes();

    /**
     * Get distinct Maven versions from active templates.
     */
    @Query("SELECT DISTINCT ct.mavenVersion FROM ConfigurationTemplate ct WHERE ct.isActive = true ORDER BY ct.mavenVersion")
    List<String> findDistinctMavenVersions();

    /**
     * Count active templates by project type.
     */
    long countByProjectTypeAndIsActiveTrue(String projectType);

    /**
     * Find templates created by a specific user.
     */
    List<ConfigurationTemplate> findByCreatedByAndIsActiveTrueOrderByCreatedAtDesc(String createdBy);

    /**
     * Check if a template with the same name already exists.
     */
    boolean existsByNameAndIsActiveTrue(String name);
}