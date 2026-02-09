package com.bookstore.onlinebookstore.service;

import com.bookstore.onlinebookstore.dto.UserProfileDto;
import com.bookstore.onlinebookstore.dto.UserRegistrationRequest;
import com.bookstore.onlinebookstore.entity.Role;
import com.bookstore.onlinebookstore.entity.User;
import com.bookstore.onlinebookstore.exception.ResourceNotFoundException;
import com.bookstore.onlinebookstore.exception.UserAlreadyExistsException;
import com.bookstore.onlinebookstore.repository.UserRepository;
import com.bookstore.onlinebookstore.security.UserPrincipal;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.Optional;

/**
 * Service class for user management operations
 */
@Service
@Transactional
public class UserService implements UserDetailsService {
    
    private static final Logger logger = LoggerFactory.getLogger(UserService.class);
    
    @Autowired
    private UserRepository userRepository;
    
    @Autowired
    private PasswordEncoder passwordEncoder;
    
    /**
     * Load user by username for Spring Security
     * @param username the username or email
     * @return UserDetails instance
     * @throws UsernameNotFoundException if user not found
     */
    @Override
    @Cacheable(value = "users", key = "#username")
    public UserDetails loadUserByUsername(String username) throws UsernameNotFoundException {
        User user = userRepository.findByUsernameOrEmail(username, username)
                .orElseThrow(() -> new UsernameNotFoundException("User not found: " + username));
        
        return UserPrincipal.create(user);
    }
    
    /**
     * Register a new user
     * @param registrationRequest the registration request
     * @return created user
     * @throws UserAlreadyExistsException if user already exists
     */
    public User registerUser(UserRegistrationRequest registrationRequest) {
        logger.info("Registering new user: {}", registrationRequest.getUsername());
        
        // Check if username already exists
        if (userRepository.existsByUsername(registrationRequest.getUsername())) {
            throw new UserAlreadyExistsException("Username already exists: " + registrationRequest.getUsername());
        }
        
        // Check if email already exists
        if (userRepository.existsByEmail(registrationRequest.getEmail())) {
            throw new UserAlreadyExistsException("Email already exists: " + registrationRequest.getEmail());
        }
        
        // Create new user
        User user = new User();
        user.setUsername(registrationRequest.getUsername());
        user.setEmail(registrationRequest.getEmail());
        user.setPassword(passwordEncoder.encode(registrationRequest.getPassword()));
        user.setFirstName(registrationRequest.getFirstName());
        user.setLastName(registrationRequest.getLastName());
        user.addRole(Role.USER);
        
        User savedUser = userRepository.save(user);
        logger.info("User registered successfully: {}", savedUser.getUsername());
        
        return savedUser;
    }
    
    /**
     * Find user by username
     * @param username the username
     * @return user if found
     * @throws ResourceNotFoundException if user not found
     */
    @Cacheable(value = "users", key = "#username")
    public User findByUsername(String username) {
        return userRepository.findByUsername(username)
                .orElseThrow(() -> new ResourceNotFoundException("User not found: " + username));
    }
    
    /**
     * Find user by email
     * @param email the email
     * @return user if found
     * @throws ResourceNotFoundException if user not found
     */
    @Cacheable(value = "users", key = "#email")
    public User findByEmail(String email) {
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("User not found: " + email));
    }
    
    /**
     * Find user by ID
     * @param id the user ID
     * @return user if found
     * @throws ResourceNotFoundException if user not found
     */
    @Cacheable(value = "users", key = "#id")
    public User findById(Long id) {
        return userRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + id));
    }
    
    /**
     * Update user's last login time
     * @param username the username
     */
    @CacheEvict(value = "users", key = "#username")
    public void updateLastLogin(String username) {
        Optional<User> userOpt = userRepository.findByUsername(username);
        if (userOpt.isPresent()) {
            User user = userOpt.get();
            user.setLastLoginAt(LocalDateTime.now());
            userRepository.save(user);
            logger.debug("Updated last login for user: {}", username);
        }
    }
    
    /**
     * Get user profile DTO
     * @param userId the user ID
     * @return user profile DTO
     */
    @Cacheable(value = "userProfiles", key = "#userId")
    public UserProfileDto getUserProfile(Long userId) {
        User user = findById(userId);
        return convertToProfileDto(user);
    }
    
    /**
     * Update user profile
     * @param userId the user ID
     * @param firstName the first name
     * @param lastName the last name
     * @param email the email
     * @return updated user profile DTO
     */
    @CacheEvict(value = {"users", "userProfiles"}, key = "#userId")
    public UserProfileDto updateUserProfile(Long userId, String firstName, String lastName, String email) {
        User user = findById(userId);
        
        // Check if email is being changed and if it already exists
        if (email != null && !email.equals(user.getEmail()) && userRepository.existsByEmail(email)) {
            throw new UserAlreadyExistsException("Email already exists: " + email);
        }
        
        if (firstName != null) {
            user.setFirstName(firstName);
        }
        if (lastName != null) {
            user.setLastName(lastName);
        }
        if (email != null) {
            user.setEmail(email);
        }
        
        User updatedUser = userRepository.save(user);
        logger.info("User profile updated: {}", updatedUser.getUsername());
        
        return convertToProfileDto(updatedUser);
    }
    
    /**
     * Check if user exists by username
     * @param username the username
     * @return true if exists, false otherwise
     */
    public boolean existsByUsername(String username) {
        return userRepository.existsByUsername(username);
    }
    
    /**
     * Check if user exists by email
     * @param email the email
     * @return true if exists, false otherwise
     */
    public boolean existsByEmail(String email) {
        return userRepository.existsByEmail(email);
    }
    
    /**
     * Convert User entity to UserProfileDto
     * @param user the user entity
     * @return user profile DTO
     */
    private UserProfileDto convertToProfileDto(User user) {
        return new UserProfileDto(
                user.getId(),
                user.getUsername(),
                user.getEmail(),
                user.getFirstName(),
                user.getLastName(),
                user.getRoles(),
                user.getCreatedAt(),
                user.getLastLoginAt()
        );
    }
}
