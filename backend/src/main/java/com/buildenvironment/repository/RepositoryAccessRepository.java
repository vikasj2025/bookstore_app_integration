package com.buildenvironment.repository;

import com.buildenvironment.entity.RepositoryAccess;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

/**
 * Repository interface for RepositoryAccess entity operations.
 */
@Repository
public interface RepositoryAccessRepository extends JpaRepository<RepositoryAccess, UUID> {

    /**
     * Find all repository access configurations for a specific environment.
     */
    List<RepositoryAccess> findByBuildEnvironment_EnvironmentId(UUID environmentId);

    /**
     * Find repository access by URL in a specific environment.
     */
    Optional<RepositoryAccess> findByBuildEnvironment_EnvironmentIdAndRepositoryUrl(UUID environmentId, String repositoryUrl);

    /**
     * Find repository access configurations by status.
     */
    List<RepositoryAccess> findByStatus(RepositoryAccess.AccessStatus status);

    /**
     * Find repository access configurations by authentication type.
     */
    List<RepositoryAccess> findByAuthenticationType(RepositoryAccess.AuthenticationType authenticationType);

    /**
     * Find repository access configurations that need validation.
     */
    @Query("SELECT ra FROM RepositoryAccess ra WHERE ra.lastValidated IS NULL OR ra.lastValidated < :threshold")
    List<RepositoryAccess> findNeedingValidation(@Param("threshold") LocalDateTime threshold);

    /**
     * Find repository access configurations by validation status.
     */
    List<RepositoryAccess> findByValidationStatus(RepositoryAccess.ValidationStatus validationStatus);

    /**
     * Check if repository URL is already configured in an environment.
     */
    @Query("SELECT COUNT(ra) > 0 FROM RepositoryAccess ra WHERE ra.buildEnvironment.environmentId = :environmentId AND ra.repositoryUrl = :repositoryUrl")
    boolean existsByEnvironmentAndRepositoryUrl(@Param("environmentId") UUID environmentId, 
                                               @Param("repositoryUrl") String repositoryUrl);

    /**
     * Find active repository access configurations for an environment.
     */
    @Query("SELECT ra FROM RepositoryAccess ra WHERE ra.buildEnvironment.environmentId = :environmentId AND ra.status = 'ACTIVE'")
    List<RepositoryAccess> findActiveByEnvironmentId(@Param("environmentId") UUID environmentId);

    /**
     * Count repository access configurations by status.
     */
    @Query("SELECT COUNT(ra) FROM RepositoryAccess ra WHERE ra.status = :status")
    Long countByStatus(@Param("status") RepositoryAccess.AccessStatus status);
}