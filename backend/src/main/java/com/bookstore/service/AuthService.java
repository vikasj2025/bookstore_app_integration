package com.bookstore.service;

import com.bookstore.dto.auth.*;
import com.bookstore.entity.User;
import com.bookstore.repository.UserRepository;
import com.bookstore.security.JwtUtil;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

/**
 * Service class for authentication operations.
 */
@Service
@Transactional
public class AuthService implements UserDetailsService {
    
    private static final Logger logger = LoggerFactory.getLogger(AuthService.class);
    
    @Autowired
    private UserRepository userRepository;
    
    @Autowired
    private PasswordEncoder passwordEncoder;
    
    @Autowired
    private AuthenticationManager authenticationManager;
    
    @Autowired
    private JwtUtil jwtUtil;
    
    @Autowired
    private CartService cartService;
    
    /**
     * Register a new user.
     * @param request registration request
     * @return authentication response with tokens
     */
    public AuthResponse register(RegisterRequest request) {
        logger.info("Registering new user with email: {}", request.getEmail());
        
        // Check if user already exists
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new IllegalArgumentException("User with email already exists: " + request.getEmail());
        }
        
        // Create new user
        User user = new User();
        user.setEmail(request.getEmail());
        user.setPassword(passwordEncoder.encode(request.getPassword()));
        user.setFirstName(request.getFirstName());
        user.setLastName(request.getLastName());
        user.setRole(User.Role.USER);
        
        User savedUser = userRepository.save(user);
        
        // Create cart for new user
        cartService.createCartForUser(savedUser);
        
        // Generate tokens
        String accessToken = jwtUtil.generateToken(savedUser);
        String refreshToken = jwtUtil.generateRefreshToken(savedUser);
        
        logger.info("Successfully registered user: {}", savedUser.getEmail());
        
        return createAuthResponse(savedUser, accessToken, refreshToken);
    }
    
    /**
     * Authenticate user login.
     * @param request login request
     * @return authentication response with tokens
     */
    public AuthResponse login(LoginRequest request) {
        logger.info("Authenticating user: {}", request.getEmail());
        
        try {
            // Authenticate user
            Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(request.getEmail(), request.getPassword())
            );
            
            User user = (User) authentication.getPrincipal();
            
            // Generate tokens
            String accessToken = jwtUtil.generateToken(user);
            String refreshToken = jwtUtil.generateRefreshToken(user);
            
            logger.info("Successfully authenticated user: {}", user.getEmail());
            
            return createAuthResponse(user, accessToken, refreshToken);
            
        } catch (BadCredentialsException e) {
            logger.warn("Failed authentication attempt for user: {}", request.getEmail());
            throw new BadCredentialsException("Invalid email or password");
        }
    }
    
    /**
     * Refresh access token using refresh token.
     * @param request refresh token request
     * @return authentication response with new tokens
     */
    public AuthResponse refreshToken(RefreshTokenRequest request) {
        String refreshToken = request.getRefreshToken();
        
        if (!jwtUtil.validateToken(refreshToken) || !jwtUtil.isRefreshToken(refreshToken)) {
            throw new BadCredentialsException("Invalid refresh token");
        }
        
        String username = jwtUtil.extractUsername(refreshToken);
        User user = userRepository.findByEmail(username)
            .orElseThrow(() -> new UsernameNotFoundException("User not found: " + username));
        
        // Generate new tokens
        String newAccessToken = jwtUtil.generateToken(user);
        String newRefreshToken = jwtUtil.generateRefreshToken(user);
        
        logger.info("Successfully refreshed tokens for user: {}", user.getEmail());
        
        return createAuthResponse(user, newAccessToken, newRefreshToken);
    }
    
    /**
     * Logout user (in a stateless JWT system, this is mainly for client-side token removal).
     * @param userEmail user email
     */
    public void logout(String userEmail) {
        logger.info("User logged out: {}", userEmail);
        // In a stateless JWT system, logout is handled client-side
        // Here we could implement token blacklisting if needed
    }
    
    /**
     * Load user by username for Spring Security.
     * @param username the username (email)
     * @return UserDetails
     */
    @Override
    public UserDetails loadUserByUsername(String username) throws UsernameNotFoundException {
        return userRepository.findByEmail(username)
            .orElseThrow(() -> new UsernameNotFoundException("User not found: " + username));
    }
    
    /**
     * Create authentication response.
     * @param user the user
     * @param accessToken access token
     * @param refreshToken refresh token
     * @return authentication response
     */
    private AuthResponse createAuthResponse(User user, String accessToken, String refreshToken) {
        UserProfileDto userProfile = new UserProfileDto();
        userProfile.setId(user.getId());
        userProfile.setEmail(user.getEmail());
        userProfile.setFirstName(user.getFirstName());
        userProfile.setLastName(user.getLastName());
        userProfile.setRole(user.getRole().name());
        userProfile.setCreatedAt(user.getCreatedAt());
        
        AuthResponse response = new AuthResponse();
        response.setAccessToken(accessToken);
        response.setRefreshToken(refreshToken);
        response.setTokenType("Bearer");
        response.setExpiresIn(jwtUtil.getJwtExpiration() / 1000); // Convert to seconds
        response.setUser(userProfile);
        
        return response;
    }
    
    /**
     * Get user by email.
     * @param email user email
     * @return user
     */
    public User getUserByEmail(String email) {
        return userRepository.findByEmail(email)
            .orElseThrow(() -> new UsernameNotFoundException("User not found: " + email));
    }
    
    /**
     * Check if user exists by email.
     * @param email user email
     * @return true if exists, false otherwise
     */
    public boolean userExists(String email) {
        return userRepository.existsByEmail(email);
    }
}