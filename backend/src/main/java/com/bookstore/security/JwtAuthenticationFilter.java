package com.bookstore.security;

import com.bookstore.service.UserService;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.stereotype.Component;
import org.springframework.util.StringUtils;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;

/**
 * JWT Authentication Filter for processing JWT tokens in requests.
 * 
 * This filter intercepts HTTP requests, extracts JWT tokens from the
 * Authorization header, validates them, and sets up the security context
 * for authenticated users.
 */
@Component
public class JwtAuthenticationFilter extends OncePerRequestFilter {

    private static final Logger logger = LoggerFactory.getLogger(JwtAuthenticationFilter.class);
    
    private static final String AUTHORIZATION_HEADER = "Authorization";
    private static final String BEARER_PREFIX = "Bearer ";

    @Autowired
    private JwtUtil jwtUtil;

    @Autowired
    private UserService userService;

    /**
     * Filter method to process JWT authentication.
     * 
     * @param request HTTP request
     * @param response HTTP response
     * @param filterChain filter chain
     * @throws ServletException if servlet error occurs
     * @throws IOException if I/O error occurs
     */
    @Override
    protected void doFilterInternal(HttpServletRequest request, 
                                  HttpServletResponse response, 
                                  FilterChain filterChain) throws ServletException, IOException {
        
        try {
            // Extract JWT token from request
            String jwt = getJwtFromRequest(request);
            
            if (jwt != null && jwtUtil.validateToken(jwt)) {
                // Extract username from token
                String username = jwtUtil.extractUsername(jwt);
                
                // Check if user is not already authenticated
                if (username != null && SecurityContextHolder.getContext().getAuthentication() == null) {
                    // Load user details
                    UserDetails userDetails = userService.loadUserByUsername(username);
                    
                    // Validate token against user details
                    if (jwtUtil.validateToken(jwt, userDetails)) {
                        // Create authentication token
                        UsernamePasswordAuthenticationToken authToken = 
                            new UsernamePasswordAuthenticationToken(
                                userDetails, 
                                null, 
                                userDetails.getAuthorities()
                            );
                        
                        // Set authentication details
                        authToken.setDetails(new WebAuthenticationDetailsSource().buildDetails(request));
                        
                        // Set authentication in security context
                        SecurityContextHolder.getContext().setAuthentication(authToken);
                        
                        logger.debug("Successfully authenticated user: {}", username);
                    } else {
                        logger.warn("JWT token validation failed for user: {}", username);
                    }
                }
            } else if (jwt != null) {
                logger.warn("Invalid JWT token received");
            }
        } catch (Exception e) {
            logger.error("Cannot set user authentication: {}", e.getMessage(), e);
            // Don't throw exception, just log and continue
            // This allows the request to proceed without authentication
            // and let the security configuration handle unauthorized access
        }
        
        // Continue with the filter chain
        filterChain.doFilter(request, response);
    }

    /**
     * Extract JWT token from the Authorization header.
     * 
     * @param request HTTP request
     * @return JWT token string or null if not found
     */
    private String getJwtFromRequest(HttpServletRequest request) {
        String bearerToken = request.getHeader(AUTHORIZATION_HEADER);
        
        if (StringUtils.hasText(bearerToken) && bearerToken.startsWith(BEARER_PREFIX)) {
            return bearerToken.substring(BEARER_PREFIX.length());
        }
        
        return null;
    }

    /**
     * Determine if the filter should be applied to the request.
     * 
     * @param request HTTP request
     * @return true if filter should be applied
     */
    @Override
    protected boolean shouldNotFilter(HttpServletRequest request) {
        String path = request.getRequestURI();
        
        // Skip filter for public endpoints
        return path.startsWith("/api/v1/users/register") ||
               path.startsWith("/api/v1/users/login") ||
               path.startsWith("/api/v1/health") ||
               path.startsWith("/actuator") ||
               path.startsWith("/api-docs") ||
               path.startsWith("/swagger-ui") ||
               path.startsWith("/v3/api-docs") ||
               (path.startsWith("/api/v1/books") && "GET".equals(request.getMethod())) ||
               (path.startsWith("/api/v1/payments/webhooks") && "POST".equals(request.getMethod()));
    }
}