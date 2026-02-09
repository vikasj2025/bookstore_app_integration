package com.bookstore.onlinebookstore.service;

import com.bookstore.onlinebookstore.dto.AuthDto;
import com.bookstore.onlinebookstore.entity.User;
import com.bookstore.onlinebookstore.exception.InvalidCredentialsException;
import com.bookstore.onlinebookstore.exception.InvalidTokenException;
import com.bookstore.onlinebookstore.security.JwtTokenProvider;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.AuthenticationException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

/**
 * Service class for authentication operations.
 */
@Service
@Transactional
public class AuthService {

    private static final Logger logger = LoggerFactory.getLogger(AuthService.class);

    private final UserService userService;
    private final AuthenticationManager authenticationManager;
    private final JwtTokenProvider jwtTokenProvider;

    @Autowired
    public AuthService(UserService userService,
                      AuthenticationManager authenticationManager,
                      JwtTokenProvider jwtTokenProvider) {
        this.userService = userService;
        this.authenticationManager = authenticationManager;
        this.jwtTokenProvider = jwtTokenProvider;
    }

    /**
     * Register a new user.
     * 
     * @param request user registration request
     * @return authentication response with tokens
     */
    public AuthDto.AuthResponse register(AuthDto.UserRegistrationRequest request) {
        logger.info("Registering new user with email: {}", request.getEmail());
        
        AuthDto.UserProfileResponse userProfile = userService.registerUser(request);
        
        // Generate tokens for the new user
        String accessToken = jwtTokenProvider.generateAccessToken(request.getEmail());
        String refreshToken = jwtTokenProvider.generateRefreshToken(request.getEmail());
        Long expiresIn = jwtTokenProvider.getAccessTokenExpirationTime();
        
        logger.info("User registered and tokens generated for email: {}", request.getEmail());
        
        return new AuthDto.AuthResponse(accessToken, refreshToken, expiresIn, userProfile);
    }

    /**
     * Authenticate user and generate tokens.
     * 
     * @param request login request
     * @return authentication response with tokens
     * @throws InvalidCredentialsException if credentials are invalid
     */
    public AuthDto.AuthResponse login(AuthDto.LoginRequest request) {
        logger.info("Authenticating user with email: {}", request.getEmail());
        
        try {
            // Authenticate user
            Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(request.getEmail(), request.getPassword())
            );
            
            // Get user details
            User user = userService.findByEmail(request.getEmail());
            AuthDto.UserProfileResponse userProfile = userService.getUserProfile(user.getId());
            
            // Generate tokens
            String accessToken = jwtTokenProvider.generateAccessToken(request.getEmail());
            String refreshToken = jwtTokenProvider.generateRefreshToken(request.getEmail());
            Long expiresIn = jwtTokenProvider.getAccessTokenExpirationTime();
            
            logger.info("User authenticated successfully with email: {}", request.getEmail());
            
            return new AuthDto.AuthResponse(accessToken, refreshToken, expiresIn, userProfile);
            
        } catch (AuthenticationException e) {
            logger.warn("Authentication failed for email: {}", request.getEmail());
            throw new InvalidCredentialsException("Invalid email or password");
        }
    }

    /**
     * Refresh access token using refresh token.
     * 
     * @param request refresh token request
     * @return authentication response with new tokens
     * @throws InvalidTokenException if refresh token is invalid
     */
    public AuthDto.AuthResponse refreshToken(AuthDto.RefreshTokenRequest request) {
        logger.debug("Refreshing token");
        
        try {
            // Validate refresh token
            if (!jwtTokenProvider.validateRefreshToken(request.getRefreshToken())) {
                throw new InvalidTokenException("Invalid or expired refresh token");
            }
            
            // Extract username from refresh token
            String username = jwtTokenProvider.getUsernameFromRefreshToken(request.getRefreshToken());
            
            // Get user details
            User user = userService.findByEmail(username);
            AuthDto.UserProfileResponse userProfile = userService.getUserProfile(user.getId());
            
            // Generate new tokens
            String newAccessToken = jwtTokenProvider.generateAccessToken(username);
            String newRefreshToken = jwtTokenProvider.generateRefreshToken(username);
            Long expiresIn = jwtTokenProvider.getAccessTokenExpirationTime();
            
            logger.debug("Token refreshed successfully for user: {}", username);
            
            return new AuthDto.AuthResponse(newAccessToken, newRefreshToken, expiresIn, userProfile);
            
        } catch (Exception e) {
            logger.warn("Token refresh failed: {}", e.getMessage());
            throw new InvalidTokenException("Invalid or expired refresh token");
        }
    }

    /**
     * Logout user (invalidate tokens).
     * Note: In a stateless JWT implementation, logout is typically handled client-side
     * by removing the tokens. For enhanced security, you could implement a token blacklist.
     * 
     * @param accessToken the access token to invalidate
     */
    public void logout(String accessToken) {
        logger.info("User logout requested");
        
        // In a stateless JWT implementation, logout is handled client-side
        // For enhanced security, implement token blacklisting here if needed
        
        // Example: Add token to blacklist
        // jwtTokenProvider.blacklistToken(accessToken);
        
        logger.info("User logged out successfully");
    }

    /**
     * Validate access token.
     * 
     * @param token access token
     * @return true if token is valid, false otherwise
     */
    @Transactional(readOnly = true)
    public boolean validateToken(String token) {
        try {
            return jwtTokenProvider.validateAccessToken(token);
        } catch (Exception e) {
            logger.debug("Token validation failed: {}", e.getMessage());
            return false;
        }
    }

    /**
     * Get username from access token.
     * 
     * @param token access token
     * @return username (email)
     */
    @Transactional(readOnly = true)
    public String getUsernameFromToken(String token) {
        return jwtTokenProvider.getUsernameFromAccessToken(token);
    }
}