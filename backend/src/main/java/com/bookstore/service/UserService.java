package com.bookstore.service;

import com.bookstore.dto.request.LoginRequest;
import com.bookstore.dto.request.UpdateUserRequest;
import com.bookstore.dto.request.UserRegistrationRequest;
import com.bookstore.dto.response.LoginResponse;
import com.bookstore.dto.response.UserResponse;
import com.bookstore.entity.User;
import com.bookstore.exception.ResourceNotFoundException;
import com.bookstore.exception.UserAlreadyExistsException;
import com.bookstore.mapper.UserMapper;
import com.bookstore.repository.UserRepository;
import com.bookstore.security.JwtUtil;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.UUID;

/**
 * Service class for user management operations.
 * 
 * This service handles user registration, authentication, profile management,
 * and implements Spring Security's UserDetailsService for authentication.
 */
@Service
@Transactional
public class UserService implements UserDetailsService {

    private static final Logger logger = LoggerFactory.getLogger(UserService.class);

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
    private AuthenticationManager authenticationManager;

    @Autowired
    private JwtUtil jwtUtil;

    @Autowired
    private UserMapper userMapper;

    /**
     * Load user by username for Spring Security authentication.
     * 
     * @param username the username (email)
     * @return UserDetails for authentication
     * @throws UsernameNotFoundException if user not found
     */
    @Override
    @Transactional(readOnly = true)
    public UserDetails loadUserByUsername(String username) throws UsernameNotFoundException {
        User user = userRepository.findByEmail(username)
                .orElseThrow(() -> new UsernameNotFoundException("User not found with email: " + username));
        
        logger.debug("Loaded user for authentication: {}", username);
        return user;
    }

    /**
     * Register a new user.
     * 
     * @param request user registration request
     * @return user response with created user details
     * @throws UserAlreadyExistsException if email already exists
     */
    public UserResponse registerUser(UserRegistrationRequest request) {
        logger.info("Attempting to register user with email: {}", request.getEmail());
        
        // Check if user already exists
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new UserAlreadyExistsException("User already exists with email: " + request.getEmail());
        }
        
        // Create new user entity
        User user = new User();
        user.setEmail(request.getEmail());
        user.setPassword(passwordEncoder.encode(request.getPassword()));
        user.setFirstName(request.getFirstName());
        user.setLastName(request.getLastName());
        user.setPhoneNumber(request.getPhoneNumber());
        user.setRole(User.Role.USER); // Default role
        
        // Save user
        User savedUser = userRepository.save(user);
        
        logger.info("Successfully registered user: {}", savedUser.getEmail());
        return userMapper.toUserResponse(savedUser);
    }

    /**
     * Authenticate user and generate JWT tokens.
     * 
     * @param request login request
     * @return login response with tokens and user details
     */
    public LoginResponse loginUser(LoginRequest request) {
        logger.info("Attempting login for user: {}", request.getEmail());
        
        // Authenticate user
        Authentication authentication = authenticationManager.authenticate(
            new UsernamePasswordAuthenticationToken(
                request.getEmail(),
                request.getPassword()
            )
        );
        
        // Get user details
        UserDetails userDetails = (UserDetails) authentication.getPrincipal();
        User user = userRepository.findByEmail(userDetails.getUsername())
                .orElseThrow(() -> new UsernameNotFoundException("User not found"));
        
        // Generate tokens
        String accessToken = jwtUtil.generateTokenWithUserId(userDetails, user.getId().toString());
        String refreshToken = jwtUtil.generateRefreshToken(userDetails);
        
        logger.info("Successfully authenticated user: {}", request.getEmail());
        
        return LoginResponse.builder()
                .accessToken(accessToken)
                .refreshToken(refreshToken)
                .tokenType("Bearer")
                .expiresIn(86400) // 24 hours
                .user(userMapper.toUserResponse(user))
                .build();
    }

    /**
     * Get user profile by ID.
     * 
     * @param userId user ID
     * @return user response
     * @throws ResourceNotFoundException if user not found
     */
    @Transactional(readOnly = true)
    public UserResponse getUserProfile(UUID userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + userId));
        
        return userMapper.toUserResponse(user);
    }

    /**
     * Update user profile.
     * 
     * @param userId user ID
     * @param request update request
     * @return updated user response
     * @throws ResourceNotFoundException if user not found
     */
    public UserResponse updateUserProfile(UUID userId, UpdateUserRequest request) {
        logger.info("Updating profile for user: {}", userId);
        
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + userId));
        
        // Update user fields
        if (request.getFirstName() != null) {
            user.setFirstName(request.getFirstName());
        }
        if (request.getLastName() != null) {
            user.setLastName(request.getLastName());
        }
        if (request.getPhoneNumber() != null) {
            user.setPhoneNumber(request.getPhoneNumber());
        }
        if (request.getAddress() != null) {
            user.setAddress(request.getAddress());
        }
        
        User updatedUser = userRepository.save(user);
        
        logger.info("Successfully updated profile for user: {}", userId);
        return userMapper.toUserResponse(updatedUser);
    }

    /**
     * Get user by email.
     * 
     * @param email user email
     * @return user entity
     * @throws ResourceNotFoundException if user not found
     */
    @Transactional(readOnly = true)
    public User getUserByEmail(String email) {
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with email: " + email));
    }

    /**
     * Get user by ID.
     * 
     * @param userId user ID
     * @return user entity
     * @throws ResourceNotFoundException if user not found
     */
    @Transactional(readOnly = true)
    public User getUserById(UUID userId) {
        return userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + userId));
    }

    /**
     * Check if user exists by email.
     * 
     * @param email user email
     * @return true if user exists
     */
    @Transactional(readOnly = true)
    public boolean existsByEmail(String email) {
        return userRepository.existsByEmail(email);
    }

    /**
     * Get all users with pagination (admin only).
     * 
     * @param pageable pagination information
     * @return page of user responses
     */
    @Transactional(readOnly = true)
    public Page<UserResponse> getAllUsers(Pageable pageable) {
        return userRepository.findAll(pageable)
                .map(userMapper::toUserResponse);
    }

    /**
     * Search users by name or email (admin only).
     * 
     * @param searchTerm search term
     * @param pageable pagination information
     * @return page of user responses
     */
    @Transactional(readOnly = true)
    public Page<UserResponse> searchUsers(String searchTerm, Pageable pageable) {
        return userRepository.searchUsers(searchTerm, pageable)
                .map(userMapper::toUserResponse);
    }

    /**
     * Get users by role (admin only).
     * 
     * @param role user role
     * @param pageable pagination information
     * @return page of user responses
     */
    @Transactional(readOnly = true)
    public Page<UserResponse> getUsersByRole(User.Role role, Pageable pageable) {
        return userRepository.findByRole(role, pageable)
                .map(userMapper::toUserResponse);
    }

    /**
     * Get recently registered users (admin only).
     * 
     * @param days number of days to look back
     * @param pageable pagination information
     * @return page of user responses
     */
    @Transactional(readOnly = true)
    public Page<UserResponse> getRecentlyRegisteredUsers(int days, Pageable pageable) {
        LocalDateTime since = LocalDateTime.now().minusDays(days);
        return userRepository.findRecentlyRegisteredUsers(since, pageable)
                .map(userMapper::toUserResponse);
    }

    /**
     * Update user enabled status (admin only).
     * 
     * @param userId user ID
     * @param enabled new enabled status
     */
    public void updateUserEnabledStatus(UUID userId, boolean enabled) {
        logger.info("Updating enabled status for user {} to: {}", userId, enabled);
        
        User user = getUserById(userId);
        user.setEnabled(enabled);
        userRepository.save(user);
        
        logger.info("Successfully updated enabled status for user: {}", userId);
    }

    /**
     * Update user role (admin only).
     * 
     * @param userId user ID
     * @param role new role
     */
    public void updateUserRole(UUID userId, User.Role role) {
        logger.info("Updating role for user {} to: {}", userId, role);
        
        User user = getUserById(userId);
        user.setRole(role);
        userRepository.save(user);
        
        logger.info("Successfully updated role for user: {}", userId);
    }

    /**
     * Get user statistics (admin only).
     * 
     * @return user statistics
     */
    @Transactional(readOnly = true)
    public UserStatistics getUserStatistics() {
        long totalUsers = userRepository.count();
        long activeUsers = userRepository.countByEnabled(true);
        long adminUsers = userRepository.countByRole(User.Role.ADMIN);
        long recentUsers = userRepository.countByCreatedAtAfter(LocalDateTime.now().minusDays(30));
        
        return new UserStatistics(totalUsers, activeUsers, adminUsers, recentUsers);
    }

    /**
     * User statistics data class.
     */
    public static class UserStatistics {
        private final long totalUsers;
        private final long activeUsers;
        private final long adminUsers;
        private final long recentUsers;
        
        public UserStatistics(long totalUsers, long activeUsers, long adminUsers, long recentUsers) {
            this.totalUsers = totalUsers;
            this.activeUsers = activeUsers;
            this.adminUsers = adminUsers;
            this.recentUsers = recentUsers;
        }
        
        // Getters
        public long getTotalUsers() { return totalUsers; }
        public long getActiveUsers() { return activeUsers; }
        public long getAdminUsers() { return adminUsers; }
        public long getRecentUsers() { return recentUsers; }
    }
}