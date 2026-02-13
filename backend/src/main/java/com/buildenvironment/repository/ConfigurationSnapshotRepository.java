package com.buildenvironment.repository;

import com.buildenvironment.entity.ConfigurationSnapshot;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

/**
 * Repository interface for ConfigurationSnapshot entity operations.
 */
@Repository
public interface ConfigurationSnapshotRepository extends JpaRepository<ConfigurationSnapshot, UUID> {

    /**
     * Find all snapshots for a specific environment, ordered by creation date descending.
     */
    List<ConfigurationSnapshot> findByBuildEnvironment_EnvironmentIdOrderByCreatedAtDesc(UUID environmentId);

    /**
     * Find snapshots for a specific environment with pagination.
     */
    List<ConfigurationSnapshot> findByBuildEnvironment_EnvironmentIdOrderByCreatedAtDesc(UUID environmentId, Pageable pageable);

    /**
     * Find stable snapshots for a specific environment.
     */
    List<ConfigurationSnapshot> findByBuildEnvironment_EnvironmentIdAndIsStableTrueOrderByCreatedAtDesc(UUID environmentId);

    /**
     * Find snapshots by status.
     */
    List<ConfigurationSnapshot> findByStatus(ConfigurationSnapshot.SnapshotStatus status);

    /**
     * Find snapshots created by a specific user.
     */
    List<ConfigurationSnapshot> findByCreatedByOrderByCreatedAtDesc(String createdBy);

    /**
     * Find snapshots created within a date range.
     */
    @Query("SELECT cs FROM ConfigurationSnapshot cs WHERE cs.createdAt BETWEEN :startDate AND :endDate ORDER BY cs.createdAt DESC")
    List<ConfigurationSnapshot> findByCreatedAtBetween(@Param("startDate") LocalDateTime startDate, 
                                                       @Param("endDate") LocalDateTime endDate);

    /**
     * Find snapshots containing a specific tag.
     */
    @Query("SELECT cs FROM ConfigurationSnapshot cs JOIN cs.tags t WHERE t = :tag ORDER BY cs.createdAt DESC")
    List<ConfigurationSnapshot> findByTag(@Param("tag") String tag);

    /**
     * Find the most recent stable snapshot for an environment.
     */
    Optional<ConfigurationSnapshot> findFirstByBuildEnvironment_EnvironmentIdAndIsStableTrueOrderByCreatedAtDesc(UUID environmentId);

    /**
     * Count snapshots for a specific environment.
     */
    @Query("SELECT COUNT(cs) FROM ConfigurationSnapshot cs WHERE cs.buildEnvironment.environmentId = :environmentId")
    Long countByEnvironmentId(@Param("environmentId") UUID environmentId);

    /**
     * Check if snapshot name exists in an environment.
     */
    @Query("SELECT COUNT(cs) > 0 FROM ConfigurationSnapshot cs WHERE cs.buildEnvironment.environmentId = :environmentId AND cs.name = :name")
    boolean existsByEnvironmentIdAndName(@Param("environmentId") UUID environmentId, 
                                        @Param("name") String name);

    /**
     * Find snapshots older than a specific date for cleanup.
     */
    @Query("SELECT cs FROM ConfigurationSnapshot cs WHERE cs.createdAt < :threshold AND cs.isStable = false")
    List<ConfigurationSnapshot> findOldNonStableSnapshots(@Param("threshold") LocalDateTime threshold);
}