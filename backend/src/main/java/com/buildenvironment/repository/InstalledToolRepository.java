package com.buildenvironment.repository;

import com.buildenvironment.entity.InstalledTool;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

/**
 * Repository interface for InstalledTool entity operations.
 */
@Repository
public interface InstalledToolRepository extends JpaRepository<InstalledTool, UUID> {

    /**
     * Find all tools installed in a specific environment.
     */
    List<InstalledTool> findByBuildEnvironment_EnvironmentId(UUID environmentId);

    /**
     * Find tools by type in a specific environment.
     */
    List<InstalledTool> findByBuildEnvironment_EnvironmentIdAndToolType(UUID environmentId, InstalledTool.ToolType toolType);

    /**
     * Find default tool of a specific type in an environment.
     */
    Optional<InstalledTool> findByBuildEnvironment_EnvironmentIdAndToolTypeAndIsDefaultTrue(UUID environmentId, InstalledTool.ToolType toolType);

    /**
     * Find tool by type and version in an environment.
     */
    Optional<InstalledTool> findByBuildEnvironment_EnvironmentIdAndToolTypeAndVersion(UUID environmentId, InstalledTool.ToolType toolType, String version);

    /**
     * Find all tools of a specific type across all environments.
     */
    List<InstalledTool> findByToolType(InstalledTool.ToolType toolType);

    /**
     * Find tools by status in a specific environment.
     */
    List<InstalledTool> findByBuildEnvironment_EnvironmentIdAndStatus(UUID environmentId, InstalledTool.ToolStatus status);

    /**
     * Check if a tool version is already installed in an environment.
     */
    @Query("SELECT COUNT(it) > 0 FROM InstalledTool it WHERE it.buildEnvironment.environmentId = :environmentId AND it.toolType = :toolType AND it.version = :version")
    boolean existsByEnvironmentAndToolTypeAndVersion(@Param("environmentId") UUID environmentId, 
                                                    @Param("toolType") InstalledTool.ToolType toolType, 
                                                    @Param("version") String version);

    /**
     * Count tools by type.
     */
    @Query("SELECT COUNT(it) FROM InstalledTool it WHERE it.toolType = :toolType")
    Long countByToolType(@Param("toolType") InstalledTool.ToolType toolType);

    /**
     * Find all distinct versions for a tool type.
     */
    @Query("SELECT DISTINCT it.version FROM InstalledTool it WHERE it.toolType = :toolType ORDER BY it.version")
    List<String> findDistinctVersionsByToolType(@Param("toolType") InstalledTool.ToolType toolType);
}