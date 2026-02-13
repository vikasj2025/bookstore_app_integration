package com.buildenvironment.repository;

import com.buildenvironment.entity.BuildEnvironment;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

/**
 * Repository interface for BuildEnvironment entity operations.
 */
@Repository
public interface BuildEnvironmentRepository extends JpaRepository<BuildEnvironment, UUID> {

    /**
     * Find build environment by name.
     */
    Optional<BuildEnvironment> findByEnvironmentName(String environmentName);

    /**
     * Find all build environments by status.
     */
    List<BuildEnvironment> findByStatus(BuildEnvironment.EnvironmentStatus status);

    /**
     * Find build environments by health status.
     */
    List<BuildEnvironment> findByHealthStatus(BuildEnvironment.HealthStatus healthStatus);

    /**
     * Find build environments that haven't been health checked recently.
     */
    @Query("SELECT be FROM BuildEnvironment be WHERE be.lastHealthCheck IS NULL OR be.lastHealthCheck < :threshold")
    List<BuildEnvironment> findEnvironmentsNeedingHealthCheck(@Param("threshold") LocalDateTime threshold);

    /**
     * Find build environments created within a date range.
     */
    @Query("SELECT be FROM BuildEnvironment be WHERE be.createdAt BETWEEN :startDate AND :endDate")
    List<BuildEnvironment> findByCreatedAtBetween(@Param("startDate") LocalDateTime startDate, 
                                                  @Param("endDate") LocalDateTime endDate);

    /**
     * Count environments by status.
     */
    @Query("SELECT COUNT(be) FROM BuildEnvironment be WHERE be.status = :status")
    Long countByStatus(@Param("status") BuildEnvironment.EnvironmentStatus status);

    /**
     * Find environments with specific tool installed.
     */
    @Query("SELECT DISTINCT be FROM BuildEnvironment be JOIN be.installedTools it WHERE it.toolType = :toolType")
    List<BuildEnvironment> findByInstalledToolType(@Param("toolType") com.buildenvironment.entity.InstalledTool.ToolType toolType);

    /**
     * Check if environment name exists (case-insensitive).
     */
    @Query("SELECT COUNT(be) > 0 FROM BuildEnvironment be WHERE LOWER(be.environmentName) = LOWER(:name)")
    boolean existsByEnvironmentNameIgnoreCase(@Param("name") String name);
}