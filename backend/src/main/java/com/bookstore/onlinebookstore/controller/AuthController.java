package com.bookstore.onlinebookstore.controller;

import com.bookstore.onlinebookstore.dto.AuthResponse;
import com.bookstore.onlinebookstore.dto.LoginRequest;
import com.bookstore.onlinebookstore.dto.UserProfileDto;
import com.bookstore.onlinebookstore.dto.UserRegistrationRequest;
import com.bookstore.onlinebookstore.entity.User;
import com.bookstore.onlinebookstore.security.JwtUtil;
import com.bookstore.onlinebookstore.security.UserPrincipal;
import com.bookstore.onlinebookstore.service.UserService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.Map;

/**
 * REST Controller for authentication operations
 */
@RestController
@RequestMapping("/auth")
@Tag(name = "Authentication", description = "User authentication and authorization")
public class AuthController {
    
    private static final Logger logger = LoggerFactory.getLogger(AuthController.class);
    
    @Autowired
    private AuthenticationManager authenticationManager;
    
    @Autowired
    private UserService userService;
    
    @Autowired
    private JwtUtil jwtUtil;
    
    /**
     * Register a new user
     */
    @PostMapping("/register")
    @Operation(summary = "Register a new user", description = "Create a new user account")
    public ResponseEntity<AuthResponse> registerUser(@Valid @RequestBody UserRegistrationRequest registrationRequest) {
        logger.info("User registration attempt: {}", registrationRequest.getUsername());
        
        // Register the user
        User user = userService.registerUser(registrationRequest);
        
        // Authenticate the user
        Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(
                        registrationRequest.getUsername(),
                        registrationRequest.getPassword()
                )
        );
        
        SecurityContextHolder.getContext().setAuthentication(authentication);
        
        // Generate tokens
        String accessToken = jwtUtil.generateJwtToken(authentication);
        String refreshToken = jwtUtil.generateRefreshToken(user.getUsername());
        
        // Update last login
        userService.updateLastLogin(user.getUsername());
        
        // Create user profile DTO
        UserProfileDto userProfile = userService.getUserProfile(user.getId());
        
        // Create response
        AuthResponse authResponse = new AuthResponse(
                accessToken,
                refreshToken,
                jwtUtil.getJwtExpirationMs() / 1000,
                userProfile
        );
        
        logger.info("User registered and authenticated successfully: {}", user.getUsername());
        
        return ResponseEntity.status(HttpStatus.CREATED).body(authResponse);
    }
    
    /**
     * Authenticate user and return JWT token
     */
    @PostMapping("/login")
    @Operation(summary = "User login", description = "Authenticate user and return JWT token")
    public ResponseEntity<AuthResponse> authenticateUser(@Valid @RequestBody LoginRequest loginRequest) {
        logger.info("User login attempt: {}", loginRequest.getUsername());
        
        // Authenticate the user
        Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(
                        loginRequest.getUsername(),
                        loginRequest.getPassword()
                )
        );
        
        SecurityContextHolder.getContext().setAuthentication(authentication);
        
        // Generate tokens
        String accessToken = jwtUtil.generateJwtToken(authentication);
        String refreshToken = jwtUtil.generateRefreshToken(loginRequest.getUsername());
        
        // Update last login
        userService.updateLastLogin(loginRequest.getUsername());
        
        // Get user details
        UserPrincipal userPrincipal = (UserPrincipal) authentication.getPrincipal();
        UserProfileDto userProfile = userService.getUserProfile(userPrincipal.getId());
        
        // Create response
        AuthResponse authResponse = new AuthResponse(
                accessToken,
                refreshToken,
                jwtUtil.getJwtExpirationMs() / 1000,
                userProfile
        );
        
        logger.info("User authenticated successfully: {}", loginRequest.getUsername());
        
        return ResponseEntity.ok(authResponse);
    }
    
    /**
     * Refresh JWT token
     */
    @PostMapping("/refresh")
    @Operation(summary = "Refresh JWT token", description = "Refresh the JWT token using refresh token")
    public ResponseEntity<AuthResponse> refreshToken(@RequestBody Map<String, String> request) {
        String refreshToken = request.get("refreshToken");
        
        if (refreshToken == null || !jwtUtil.validateJwtToken(refreshToken)) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }
        
        String username = jwtUtil.getUsernameFromJwtToken(refreshToken);
        User user = userService.findByUsername(username);
        
        // Create new authentication
        UserPrincipal userPrincipal = UserPrincipal.create(user);
        Authentication authentication = new UsernamePasswordAuthenticationToken(
                userPrincipal, null, userPrincipal.getAuthorities());
        
        // Generate new tokens
        String newAccessToken = jwtUtil.generateJwtToken(authentication);
        String newRefreshToken = jwtUtil.generateRefreshToken(username);
        
        // Get user profile
        UserProfileDto userProfile = userService.getUserProfile(user.getId());
        
        // Create response
        AuthResponse authResponse = new AuthResponse(
                newAccessToken,
                newRefreshToken,
                jwtUtil.getJwtExpirationMs() / 1000,
                userProfile
        );
        
        logger.info("Token refreshed successfully for user: {}", username);
        
        return ResponseEntity.ok(authResponse);
    }
    
    /**
     * Logout user
     */
    @PostMapping("/logout")
    @Operation(summary = "User logout", description = "Logout user and invalidate tokens")
    public ResponseEntity<Map<String, Object>> logoutUser() {
        // Clear security context
        SecurityContextHolder.clearContext();
        
        Map<String, Object> response = new HashMap<>();
        response.put("message", "Logout successful");
        response.put("timestamp", LocalDateTime.now());
        
        logger.info("User logged out successfully");
        
        return ResponseEntity.ok(response);
    }
}
