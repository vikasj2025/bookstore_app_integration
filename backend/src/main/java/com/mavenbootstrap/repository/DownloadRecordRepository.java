package com.mavenbootstrap.repository;

import com.mavenbootstrap.entity.DownloadRecord;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.Instant;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

/**
 * Repository interface for DownloadRecord entity.
 */
@Repository
public interface DownloadRecordRepository extends JpaRepository<DownloadRecord, UUID> {

    /**
     * Find download record by Maven version and platform.
     */
    Optional<DownloadRecord> findByMavenVersionAndPlatform(String mavenVersion, String platform);

    /**
     * Find download records by Maven version.
     */
    List<DownloadRecord> findByMavenVersion(String mavenVersion);

    /**
     * Find download records by platform.
     */
    List<DownloadRecord> findByPlatform(String platform);

    /**
     * Find download records by file name.
     */
    List<DownloadRecord> findByFileNameContainingIgnoreCase(String fileName);

    /**
     * Find verified download records.
     */
    List<DownloadRecord> findByIsVerifiedTrue();

    /**
     * Find unverified download records.
     */
    List<DownloadRecord> findByIsVerifiedFalse();

    /**
     * Find download records that need verification (older than specified time).
     */
    @Query("SELECT dr FROM DownloadRecord dr WHERE dr.isVerified = false OR dr.verificationTime < :before")
    List<DownloadRecord> findRecordsNeedingVerification(@Param("before") Instant before);

    /**
     * Find most downloaded records.
     */
    List<DownloadRecord> findTop10ByOrderByDownloadCountDesc();

    /**
     * Find recently downloaded records.
     */
    List<DownloadRecord> findByLastDownloadedAfterOrderByLastDownloadedDesc(Instant since);

    /**
     * Get total download count.
     */
    @Query("SELECT SUM(dr.downloadCount) FROM DownloadRecord dr")
    Long getTotalDownloadCount();

    /**
     * Get download count by platform.
     */
    @Query("SELECT dr.platform, SUM(dr.downloadCount) FROM DownloadRecord dr GROUP BY dr.platform")
    List<Object[]> getDownloadCountByPlatform();

    /**
     * Get download count by Maven version.
     */
    @Query("SELECT dr.mavenVersion, SUM(dr.downloadCount) FROM DownloadRecord dr GROUP BY dr.mavenVersion ORDER BY SUM(dr.downloadCount) DESC")
    List<Object[]> getDownloadCountByMavenVersion();

    /**
     * Find records with specific checksum.
     */
    Optional<DownloadRecord> findByChecksumSha256(String checksumSha256);

    /**
     * Count downloads in the last period.
     */
    @Query("SELECT COUNT(dr) FROM DownloadRecord dr WHERE dr.lastDownloaded >= :since")
    long countDownloadsSince(@Param("since") Instant since);

    /**
     * Find records by file size range.
     */
    List<DownloadRecord> findByFileSizeBetween(Long minSize, Long maxSize);

    /**
     * Delete old download records.
     */
    void deleteByCreatedAtBefore(Instant before);

    /**
     * Find distinct Maven versions.
     */
    @Query("SELECT DISTINCT dr.mavenVersion FROM DownloadRecord dr ORDER BY dr.mavenVersion")
    List<String> findDistinctMavenVersions();

    /**
     * Find distinct platforms.
     */
    @Query("SELECT DISTINCT dr.platform FROM DownloadRecord dr ORDER BY dr.platform")
    List<String> findDistinctPlatforms();
}