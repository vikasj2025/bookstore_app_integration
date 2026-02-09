package com.bookstore.controller;

import com.bookstore.dto.request.LoginRequest;
import com.bookstore.dto.request.UpdateUserRequest;
import com.bookstore.dto.request.UserRegistrationRequest;
import com.bookstore.dto.response.LoginResponse;
import com.bookstore.dto.response.UserResponse;
import com.bookstore.entity.User;
import com.bookstore.service.UserService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

/**
 * REST controller for user management operations.
 * 
 * This controller handles user registration, authentication, and profile management
 * for the Online Bookstore application.
 */
@RestController
@RequestMapping("/api/v1/users")
@Tag(name = "User Management", description = "User authentication and profile management operations")
public class UserController {

    private static final Logger logger = LoggerFactory.getLogger(UserController.class);

    @Autowired
    private UserService userService;

    /**
     * Register a new user.
     * 
     * @param request user registration request
     * @return created user response
     */
    @PostMapping("/register")
    @Operation(
        summary = "Register new user",
        description = "Create a new user account with email, password, and profile information"
    )
    @ApiResponses(value = {
        @ApiResponse(
            responseCode = "201",
            description = "User registered successfully",
            content = @Content(schema = @Schema(implementation = UserResponse.class))
        ),
        @ApiResponse(
            responseCode = "400",
            description = "Invalid request data",
            content = @Content(schema = @Schema(implementation = com.bookstore.dto.response.ErrorResponse.class))
        ),
        @ApiResponse(
            responseCode = "409",
            description = "User already exists with this email",
            content = @Content(schema = @Schema(implementation = com.bookstore.dto.response.ErrorResponse.class))
        )
    })
    public ResponseEntity<UserResponse> registerUser(
            @Valid @RequestBody UserRegistrationRequest request) {
        
        logger.info("User registration attempt for email: {}", request.getEmail());
        
        UserResponse userResponse = userService.registerUser(request);
        
        logger.info("User registration successful for email: {}", request.getEmail());
        return new ResponseEntity<>(userResponse, HttpStatus.CREATED);
    }

    /**
     * Authenticate user and return JWT tokens.
     * 
     * @param request login request
     * @return login response with tokens
     */
    @PostMapping("/login")
    @Operation(
        summary = "User login",
        description = "Authenticate user credentials and return JWT access and refresh tokens"
    )
    @ApiResponses(value = {
        @ApiResponse(
            responseCode = "200",
            description = "Login successful",
            content = @Content(schema = @Schema(implementation = LoginResponse.class))
        ),
        @ApiResponse(
            responseCode = "401",
            description = "Invalid credentials",
            content = @Content(schema = @Schema(implementation = com.bookstore.dto.response.ErrorResponse.class))
        ),
        @ApiResponse(
            responseCode = "429",
            description = "Too many login attempts",
            content = @Content(schema = @Schema(implementation = com.bookstore.dto.response.ErrorResponse.class))
        )
    })
    public ResponseEntity<LoginResponse> loginUser(
            @Valid @RequestBody LoginRequest request) {
        
        logger.info("Login attempt for email: {}", request.getEmail());
        
        LoginResponse loginResponse = userService.loginUser(request);
        
        logger.info("Login successful for email: {}", request.getEmail());
        return ResponseEntity.ok(loginResponse);
    }

    /**
     * Get current user's profile.
     * 
     * @return user profile
     */
    @GetMapping("/profile")
    @Operation(
        summary = "Get user profile",
        description = "Retrieve the authenticated user's profile information"
    )
    @SecurityRequirement(name = "bearerAuth")
    @ApiResponses(value = {
        @ApiResponse(
            responseCode = "200",
            description = "Profile retrieved successfully",
            content = @Content(schema = @Schema(implementation = UserResponse.class))
        ),
        @ApiResponse(
            responseCode = "401",
            description = "Authentication required",
            content = @Content(schema = @Schema(implementation = com.bookstore.dto.response.ErrorResponse.class))
        )
    })
    public ResponseEntity<UserResponse> getUserProfile() {
        UUID userId = getCurrentUserId();
        
        logger.debug("Retrieving profile for user: {}", userId);
        
        UserResponse userResponse = userService.getUserProfile(userId);
        return ResponseEntity.ok(userResponse);
    }

    /**
     * Update current user's profile.
     * 
     * @param request update request
     * @return updated user profile
     */
    @PutMapping("/profile")
    @Operation(
        summary = "Update user profile",
        description = "Update the authenticated user's profile information"
    )
    @SecurityRequirement(name = "bearerAuth")
    @ApiResponses(value = {
        @ApiResponse(
            responseCode = "200",
            description = "Profile updated successfully",
            content = @Content(schema = @Schema(implementation = UserResponse.class))
        ),
        @ApiResponse(
            responseCode = "400",
            description = "Invalid request data",
            content = @Content(schema = @Schema(implementation = com.bookstore.dto.response.ErrorResponse.class))
        ),
        @ApiResponse(
            responseCode = "401",
            description = "Authentication required",
            content = @Content(schema = @Schema(implementation = com.bookstore.dto.response.ErrorResponse.class))
        )
    })
    public ResponseEntity<UserResponse> updateUserProfile(
            @Valid @RequestBody UpdateUserRequest request) {
        
        UUID userId = getCurrentUserId();
        
        logger.info("Updating profile for user: {}", userId);
        
        UserResponse userResponse = userService.updateUserProfile(userId, request);
        
        logger.info("Profile update successful for user: {}", userId);
        return ResponseEntity.ok(userResponse);
    }

    /**
     * Get user by ID (admin only).
     * 
     * @param userId user ID
     * @return user profile
     */
    @GetMapping("/{userId}")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(
        summary = "Get user by ID",
        description = "Retrieve a user's profile by their ID (admin only)"
    )
    @SecurityRequirement(name = "bearerAuth")
    @ApiResponses(value = {
        @ApiResponse(
            responseCode = "200",
            description = "User found",
            content = @Content(schema = @Schema(implementation = UserResponse.class))
        ),
        @ApiResponse(
            responseCode = "403",
            description = "Admin access required",
            content = @Content(schema = @Schema(implementation = com.bookstore.dto.response.ErrorResponse.class))
        ),
        @ApiResponse(
            responseCode = "404",
            description = "User not found",
            content = @Content(schema = @Schema(implementation = com.bookstore.dto.response.ErrorResponse.class))
        )
    })
    public ResponseEntity<UserResponse> getUserById(
            @Parameter(description = "User ID", required = true)
            @PathVariable UUID userId) {
        
        logger.debug("Admin retrieving profile for user: {}", userId);
        
        UserResponse userResponse = userService.getUserProfile(userId);
        return ResponseEntity.ok(userResponse);
    }

    /**
     * Update user enabled status (admin only).
     * 
     * @param userId user ID
     * @param enabled new enabled status
     * @return success response
     */
    @PutMapping("/{userId}/enabled")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(
        summary = "Update user enabled status",
        description = "Enable or disable a user account (admin only)"
    )
    @SecurityRequirement(name = "bearerAuth")
    @ApiResponses(value = {
        @ApiResponse(
            responseCode = "200",
            description = "User status updated successfully"
        ),
        @ApiResponse(
            responseCode = "403",
            description = "Admin access required",
            content = @Content(schema = @Schema(implementation = com.bookstore.dto.response.ErrorResponse.class))
        ),
        @ApiResponse(
            responseCode = "404",
            description = "User not found",
            content = @Content(schema = @Schema(implementation = com.bookstore.dto.response.ErrorResponse.class))
        )
    })
    public ResponseEntity<Void> updateUserEnabledStatus(
            @Parameter(description = "User ID", required = true)
            @PathVariable UUID userId,
            @Parameter(description = "Enabled status", required = true)
            @RequestParam boolean enabled) {
        
        logger.info("Admin updating enabled status for user {} to: {}", userId, enabled);
        
        userService.updateUserEnabledStatus(userId, enabled);
        
        logger.info("Successfully updated enabled status for user: {}", userId);
        return ResponseEntity.ok().build();
    }

    /**
     * Update user role (admin only).
     * 
     * @param userId user ID
     * @param role new role
     * @return success response
     */
    @PutMapping("/{userId}/role")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(
        summary = "Update user role",
        description = "Update a user's role (admin only)"
    )
    @SecurityRequirement(name = "bearerAuth")
    @ApiResponses(value = {
        @ApiResponse(
            responseCode = "200",
            description = "User role updated successfully"
        ),
        @ApiResponse(
            responseCode = "403",
            description = "Admin access required",
            content = @Content(schema = @Schema(implementation = com.bookstore.dto.response.ErrorResponse.class))
        ),
        @ApiResponse(
            responseCode = "404",
            description = "User not found",
            content = @Content(schema = @Schema(implementation = com.bookstore.dto.response.ErrorResponse.class))
        )
    })
    public ResponseEntity<Void> updateUserRole(
            @Parameter(description = "User ID", required = true)
            @PathVariable UUID userId,
            @Parameter(description = "New role", required = true)
            @RequestParam User.Role role) {
        
        logger.info("Admin updating role for user {} to: {}", userId, role);
        
        userService.updateUserRole(userId, role);
        
        logger.info("Successfully updated role for user: {}", userId);
        return ResponseEntity.ok().build();
    }

    /**
     * Get user statistics (admin only).
     * 
     * @return user statistics
     */
    @GetMapping("/statistics")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(
        summary = "Get user statistics",
        description = "Retrieve user statistics and metrics (admin only)"
    )
    @SecurityRequirement(name = "bearerAuth")
    @ApiResponse(
        responseCode = "200",
        description = "Statistics retrieved successfully"
    )
    public ResponseEntity<UserService.UserStatistics> getUserStatistics() {
        logger.debug("Admin retrieving user statistics");
        
        UserService.UserStatistics statistics = userService.getUserStatistics();
        return ResponseEntity.ok(statistics);
    }

    /**
     * Get the current authenticated user's ID.
     * 
     * @return current user ID
     */
    private UUID getCurrentUserId() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        User user = (User) authentication.getPrincipal();
        return user.getId();
    }
}