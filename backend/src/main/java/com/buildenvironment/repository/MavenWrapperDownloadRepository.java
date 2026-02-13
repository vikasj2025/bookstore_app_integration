package com.buildenvironment.repository;

import com.buildenvironment.entity.MavenWrapperDownload;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

/**
 * Repository interface for MavenWrapperDownload entity operations.
 */
@Repository
public interface MavenWrapperDownloadRepository extends JpaRepository<MavenWrapperDownload, UUID> {

    /**
     * Find downloads by status.
     */
    List<MavenWrapperDownload> findByStatus(MavenWrapperDownload.DownloadStatus status);

    /**
     * Find downloads by project path.
     */
    List<MavenWrapperDownload> findByProjectPathOrderByStartTimeDesc(String projectPath);

    /**
     * Find the most recent download for a project path.
     */
    Optional<MavenWrapperDownload> findFirstByProjectPathOrderByStartTimeDesc(String projectPath);

    /**
     * Find downloads by Maven version.
     */
    List<MavenWrapperDownload> findByMavenVersionOrderByStartTimeDesc(String mavenVersion);

    /**
     * Find downloads started within a date range.
     */
    @Query("SELECT mwd FROM MavenWrapperDownload mwd WHERE mwd.startTime BETWEEN :startDate AND :endDate ORDER BY mwd.startTime DESC")
    List<MavenWrapperDownload> findByStartTimeBetween(@Param("startDate") LocalDateTime startDate, 
                                                     @Param("endDate") LocalDateTime endDate);

    /**
     * Find active downloads (in progress).
     */
    @Query("SELECT mwd FROM MavenWrapperDownload mwd WHERE mwd.status IN ('INITIATED', 'IN_PROGRESS')")
    List<MavenWrapperDownload> findActiveDownloads();

    /**
     * Find failed downloads.
     */
    List<MavenWrapperDownload> findByStatusOrderByStartTimeDesc(MavenWrapperDownload.DownloadStatus status);

    /**
     * Count downloads by status.
     */
    @Query("SELECT COUNT(mwd) FROM MavenWrapperDownload mwd WHERE mwd.status = :status")
    Long countByStatus(@Param("status") MavenWrapperDownload.DownloadStatus status);

    /**
     * Find downloads that have been running for too long (potential stuck downloads).
     */
    @Query("SELECT mwd FROM MavenWrapperDownload mwd WHERE mwd.status IN ('INITIATED', 'IN_PROGRESS') AND mwd.startTime < :threshold")
    List<MavenWrapperDownload> findStuckDownloads(@Param("threshold") LocalDateTime threshold);

    /**
     * Check if there's an active download for a project path.
     */
    @Query("SELECT COUNT(mwd) > 0 FROM MavenWrapperDownload mwd WHERE mwd.projectPath = :projectPath AND mwd.status IN ('INITIATED', 'IN_PROGRESS')")
    boolean hasActiveDownloadForProject(@Param("projectPath") String projectPath);
}