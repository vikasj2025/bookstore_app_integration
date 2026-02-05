package com.mavenbootstrap.repository;

import com.mavenbootstrap.entity.BootstrapOperation;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.Instant;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

/**
 * Repository interface for BootstrapOperation entity.
 */
@Repository
public interface BootstrapOperationRepository extends JpaRepository<BootstrapOperation, UUID> {

    /**
     * Find bootstrap operations by status.
     */
    List<BootstrapOperation> findByStatus(BootstrapOperation.BootstrapStatus status);

    /**
     * Find bootstrap operations by project path.
     */
    List<BootstrapOperation> findByProjectPathContainingIgnoreCase(String projectPath);

    /**
     * Find bootstrap operations by project type.
     */
    List<BootstrapOperation> findByProjectType(String projectType);

    /**
     * Find bootstrap operations by Maven version.
     */
    List<BootstrapOperation> findByMavenVersion(String mavenVersion);

    /**
     * Find bootstrap operations created after a specific time.
     */
    List<BootstrapOperation> findByCreatedAtAfter(Instant createdAt);

    /**
     * Find bootstrap operations created between two times.
     */
    List<BootstrapOperation> findByCreatedAtBetween(Instant startTime, Instant endTime);

    /**
     * Find bootstrap operations by status with pagination.
     */
    Page<BootstrapOperation> findByStatus(BootstrapOperation.BootstrapStatus status, Pageable pageable);

    /**
     * Find bootstrap operations by created by user.
     */
    List<BootstrapOperation> findByCreatedBy(String createdBy);

    /**
     * Find the most recent bootstrap operation for a project path.
     */
    Optional<BootstrapOperation> findFirstByProjectPathOrderByCreatedAtDesc(String projectPath);

    /**
     * Count bootstrap operations by status.
     */
    long countByStatus(BootstrapOperation.BootstrapStatus status);

    /**
     * Count bootstrap operations created today.
     */
    @Query("SELECT COUNT(b) FROM BootstrapOperation b WHERE DATE(b.createdAt) = CURRENT_DATE")
    long countTodaysOperations();

    /**
     * Find failed operations that can be retried.
     */
    @Query("SELECT b FROM BootstrapOperation b WHERE b.status = 'FAILED' AND b.createdAt > :since")
    List<BootstrapOperation> findFailedOperationsSince(@Param("since") Instant since);

    /**
     * Find operations that have been running for too long.
     */
    @Query("SELECT b FROM BootstrapOperation b WHERE b.status = 'IN_PROGRESS' AND b.startTime < :timeout")
    List<BootstrapOperation> findStuckOperations(@Param("timeout") Instant timeout);

    /**
     * Get bootstrap operation statistics.
     */
    @Query("SELECT b.status, COUNT(b) FROM BootstrapOperation b GROUP BY b.status")
    List<Object[]> getOperationStatistics();

    /**
     * Find operations by multiple statuses.
     */
    List<BootstrapOperation> findByStatusIn(List<BootstrapOperation.BootstrapStatus> statuses);

    /**
     * Delete old completed operations.
     */
    void deleteByStatusAndCompletionTimeBefore(BootstrapOperation.BootstrapStatus status, Instant before);
}