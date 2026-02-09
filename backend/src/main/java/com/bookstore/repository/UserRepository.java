package com.bookstore.repository;

import com.bookstore.entity.User;
import org.springframework.data.domain.Page;
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
 * Repository interface for User entity operations.
 * 
 * This repository provides data access methods for users including
 * authentication, user management, and admin operations.
 */
@Repository
public interface UserRepository extends JpaRepository<User, UUID> {

    /**
     * Find a user by email address.
     * 
     * @param email the email address to search for
     * @return Optional containing the user if found
     */
    Optional<User> findByEmail(String email);

    /**
     * Check if a user exists with the given email.
     * 
     * @param email the email to check
     * @return true if a user with this email exists
     */
    boolean existsByEmail(String email);

    /**
     * Find users by role.
     * 
     * @param role the role to filter by
     * @param pageable pagination information
     * @return page of users with the specified role
     */
    Page<User> findByRole(User.Role role, Pageable pageable);

    /**
     * Find users by enabled status.
     * 
     * @param enabled the enabled status
     * @param pageable pagination information
     * @return page of users with the specified enabled status
     */
    Page<User> findByEnabled(Boolean enabled, Pageable pageable);

    /**
     * Find users created after a specific date.
     * 
     * @param date the date threshold
     * @param pageable pagination information
     * @return page of users created after the date
     */
    Page<User> findByCreatedAtAfter(LocalDateTime date, Pageable pageable);

    /**
     * Search users by name (first name or last name).
     * 
     * @param searchTerm the search term
     * @param pageable pagination information
     * @return page of users matching the search term
     */
    @Query("SELECT u FROM User u WHERE " +
           "LOWER(u.firstName) LIKE LOWER(CONCAT('%', :searchTerm, '%')) OR " +
           "LOWER(u.lastName) LIKE LOWER(CONCAT('%', :searchTerm, '%')) OR " +
           "LOWER(u.email) LIKE LOWER(CONCAT('%', :searchTerm, '%'))")
    Page<User> searchUsers(@Param("searchTerm") String searchTerm, Pageable pageable);

    /**
     * Find users by first name and last name.
     * 
     * @param firstName the first name
     * @param lastName the last name
     * @return list of users with matching names
     */
    List<User> findByFirstNameAndLastName(String firstName, String lastName);

    /**
     * Find users with incomplete profiles (missing phone number or address).
     * 
     * @param pageable pagination information
     * @return page of users with incomplete profiles
     */
    @Query("SELECT u FROM User u WHERE u.phoneNumber IS NULL OR " +
           "u.address IS NULL OR u.address.street IS NULL OR u.address.city IS NULL")
    Page<User> findUsersWithIncompleteProfiles(Pageable pageable);

    /**
     * Count users by role.
     * 
     * @param role the role
     * @return count of users with the specified role
     */
    long countByRole(User.Role role);

    /**
     * Count enabled users.
     * 
     * @param enabled the enabled status
     * @return count of users with the specified enabled status
     */
    long countByEnabled(Boolean enabled);

    /**
     * Count users created after a specific date.
     * 
     * @param date the date threshold
     * @return count of users created after the date
     */
    long countByCreatedAtAfter(LocalDateTime date);

    /**
     * Find recently registered users.
     * 
     * @param days number of days to look back
     * @param pageable pagination information
     * @return page of recently registered users
     */
    @Query("SELECT u FROM User u WHERE u.createdAt >= :since ORDER BY u.createdAt DESC")
    Page<User> findRecentlyRegisteredUsers(@Param("since") LocalDateTime since, Pageable pageable);

    /**
     * Find admin users.
     * 
     * @return list of admin users
     */
    @Query("SELECT u FROM User u WHERE u.role = 'ADMIN' AND u.enabled = true")
    List<User> findActiveAdmins();

    /**
     * Find users by partial email match.
     * 
     * @param emailPattern the email pattern to match
     * @param pageable pagination information
     * @return page of users with matching email patterns
     */
    Page<User> findByEmailContainingIgnoreCase(String emailPattern, Pageable pageable);

    /**
     * Update user enabled status.
     * 
     * @param userId the user ID
     * @param enabled the new enabled status
     * @return number of updated records
     */
    @Query("UPDATE User u SET u.enabled = :enabled WHERE u.id = :userId")
    int updateUserEnabledStatus(@Param("userId") UUID userId, @Param("enabled") Boolean enabled);

    /**
     * Update user role.
     * 
     * @param userId the user ID
     * @param role the new role
     * @return number of updated records
     */
    @Query("UPDATE User u SET u.role = :role WHERE u.id = :userId")
    int updateUserRole(@Param("userId") UUID userId, @Param("role") User.Role role);
}