package com.bookstore.onlinebookstore.service;

import com.bookstore.onlinebookstore.dto.AuthDto;
import com.bookstore.onlinebookstore.entity.User;
import com.bookstore.onlinebookstore.exception.ResourceNotFoundException;
import com.bookstore.onlinebookstore.exception.UserAlreadyExistsException;
import com.bookstore.onlinebookstore.mapper.UserMapper;
import com.bookstore.onlinebookstore.repository.UserRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.UUID;

/**
 * Service class for user management operations.
 */
@Service
@Transactional
public class UserService implements UserDetailsService {

    private static final Logger logger = LoggerFactory.getLogger(UserService.class);

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final UserMapper userMapper;
    private final CartService cartService;

    @Autowired
    public UserService(UserRepository userRepository, 
                      PasswordEncoder passwordEncoder, 
                      UserMapper userMapper,
                      CartService cartService) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.userMapper = userMapper;
        this.cartService = cartService;
    }

    /**
     * Register a new user.
     * 
     * @param request user registration request
     * @return user profile response
     * @throws UserAlreadyExistsException if user with email already exists
     */
    public AuthDto.UserProfileResponse registerUser(AuthDto.UserRegistrationRequest request) {
        logger.info("Registering new user with email: {}", request.getEmail());
        
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new UserAlreadyExistsException("User with email " + request.getEmail() + " already exists");
        }

        User user = new User();
        user.setEmail(request.getEmail());
        user.setPassword(passwordEncoder.encode(request.getPassword()));
        user.setFirstName(request.getFirstName());
        user.setLastName(request.getLastName());
        user.setPhoneNumber(request.getPhoneNumber());
        user.setRole(User.Role.USER);
        user.setEnabled(true);

        User savedUser = userRepository.save(user);
        
        // Create cart for the new user
        cartService.createCartForUser(savedUser);
        
        logger.info("User registered successfully with ID: {}", savedUser.getId());
        return userMapper.toUserProfileResponse(savedUser);
    }

    /**
     * Find user by email.
     * 
     * @param email user email
     * @return user entity
     * @throws ResourceNotFoundException if user not found
     */
    @Transactional(readOnly = true)
    public User findByEmail(String email) {
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with email: " + email));
    }

    /**
     * Find user by ID.
     * 
     * @param userId user ID
     * @return user entity
     * @throws ResourceNotFoundException if user not found
     */
    @Transactional(readOnly = true)
    public User findById(UUID userId) {
        return userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with ID: " + userId));
    }

    /**
     * Get user profile by ID.
     * 
     * @param userId user ID
     * @return user profile response
     */
    @Transactional(readOnly = true)
    public AuthDto.UserProfileResponse getUserProfile(UUID userId) {
        User user = findById(userId);
        return userMapper.toUserProfileResponse(user);
    }

    /**
     * Update user profile.
     * 
     * @param userId user ID
     * @param request update request
     * @return updated user profile response
     */
    public AuthDto.UserProfileResponse updateUserProfile(UUID userId, AuthDto.UpdateUserProfileRequest request) {
        logger.info("Updating profile for user ID: {}", userId);
        
        User user = findById(userId);
        
        if (request.getFirstName() != null) {
            user.setFirstName(request.getFirstName());
        }
        if (request.getLastName() != null) {
            user.setLastName(request.getLastName());
        }
        if (request.getPhoneNumber() != null) {
            user.setPhoneNumber(request.getPhoneNumber());
        }

        User updatedUser = userRepository.save(user);
        logger.info("Profile updated successfully for user ID: {}", userId);
        
        return userMapper.toUserProfileResponse(updatedUser);
    }

    /**
     * Check if user exists by email.
     * 
     * @param email user email
     * @return true if user exists, false otherwise
     */
    @Transactional(readOnly = true)
    public boolean existsByEmail(String email) {
        return userRepository.existsByEmail(email);
    }

    /**
     * Enable or disable user account.
     * 
     * @param userId user ID
     * @param enabled enabled status
     */
    public void setUserEnabled(UUID userId, boolean enabled) {
        logger.info("Setting user {} enabled status to: {}", userId, enabled);
        
        User user = findById(userId);
        user.setEnabled(enabled);
        userRepository.save(user);
        
        logger.info("User {} enabled status updated to: {}", userId, enabled);
    }

    /**
     * Load user by username for Spring Security.
     * 
     * @param username the username (email)
     * @return UserDetails object
     * @throws UsernameNotFoundException if user not found
     */
    @Override
    @Transactional(readOnly = true)
    public UserDetails loadUserByUsername(String username) throws UsernameNotFoundException {
        User user = userRepository.findByEmailAndEnabled(username, true)
                .orElseThrow(() -> new UsernameNotFoundException("User not found with email: " + username));

        return org.springframework.security.core.userdetails.User.builder()
                .username(user.getEmail())
                .password(user.getPassword())
                .authorities("ROLE_" + user.getRole().name())
                .accountExpired(false)
                .accountLocked(false)
                .credentialsExpired(false)
                .disabled(!user.isEnabled())
                .build();
    }

    /**
     * Validate user credentials.
     * 
     * @param email user email
     * @param password raw password
     * @return true if credentials are valid, false otherwise
     */
    @Transactional(readOnly = true)
    public boolean validateCredentials(String email, String password) {
        try {
            User user = userRepository.findByEmailAndEnabled(email, true)
                    .orElse(null);
            
            if (user == null) {
                return false;
            }
            
            return passwordEncoder.matches(password, user.getPassword());
        } catch (Exception e) {
            logger.error("Error validating credentials for user: {}", email, e);
            return false;
        }
    }
}