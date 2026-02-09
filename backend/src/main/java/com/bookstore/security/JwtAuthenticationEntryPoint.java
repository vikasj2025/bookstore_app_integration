package com.bookstore.security;

import com.fasterxml.jackson.databind.ObjectMapper;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.MediaType;
import org.springframework.security.core.AuthenticationException;
import org.springframework.security.web.AuthenticationEntryPoint;
import org.springframework.stereotype.Component;

import java.io.IOException;
import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.Map;

/**
 * JWT Authentication Entry Point for handling authentication failures.
 * 
 * This class handles cases where authentication is required but fails,
 * returning a structured JSON error response instead of redirecting
 * to a login page (which is not applicable for REST APIs).
 */
@Component
public class JwtAuthenticationEntryPoint implements AuthenticationEntryPoint {

    private static final Logger logger = LoggerFactory.getLogger(JwtAuthenticationEntryPoint.class);
    
    private final ObjectMapper objectMapper = new ObjectMapper();

    /**
     * Handle authentication entry point.
     * 
     * This method is called when an unauthenticated user tries to access
     * a secured resource. It returns a JSON error response with 401 status.
     * 
     * @param request HTTP request
     * @param response HTTP response
     * @param authException authentication exception
     * @throws IOException if I/O error occurs
     * @throws ServletException if servlet error occurs
     */
    @Override
    public void commence(HttpServletRequest request, 
                        HttpServletResponse response,
                        AuthenticationException authException) throws IOException, ServletException {
        
        logger.warn("Unauthorized access attempt to: {} from IP: {}", 
                   request.getRequestURI(), 
                   getClientIpAddress(request));
        
        // Set response status and content type
        response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
        response.setContentType(MediaType.APPLICATION_JSON_VALUE);
        
        // Create error response body
        Map<String, Object> errorResponse = createErrorResponse(request, authException);
        
        // Write JSON response
        objectMapper.writeValue(response.getOutputStream(), errorResponse);
    }

    /**
     * Create structured error response.
     * 
     * @param request HTTP request
     * @param authException authentication exception
     * @return error response map
     */
    private Map<String, Object> createErrorResponse(HttpServletRequest request, 
                                                   AuthenticationException authException) {
        Map<String, Object> errorResponse = new HashMap<>();
        
        errorResponse.put("error", "Unauthorized");
        errorResponse.put("message", "Authentication is required to access this resource");
        errorResponse.put("details", authException.getMessage());
        errorResponse.put("timestamp", LocalDateTime.now().toString());
        errorResponse.put("path", request.getRequestURI());
        errorResponse.put("status", HttpServletResponse.SC_UNAUTHORIZED);
        
        // Add additional context for debugging (only in development)
        if (isDevelopmentMode()) {
            errorResponse.put("method", request.getMethod());
            errorResponse.put("userAgent", request.getHeader("User-Agent"));
            errorResponse.put("remoteAddr", getClientIpAddress(request));
        }
        
        return errorResponse;
    }

    /**
     * Get client IP address from request.
     * 
     * @param request HTTP request
     * @return client IP address
     */
    private String getClientIpAddress(HttpServletRequest request) {
        String xForwardedFor = request.getHeader("X-Forwarded-For");
        if (xForwardedFor != null && !xForwardedFor.isEmpty()) {
            return xForwardedFor.split(",")[0].trim();
        }
        
        String xRealIp = request.getHeader("X-Real-IP");
        if (xRealIp != null && !xRealIp.isEmpty()) {
            return xRealIp;
        }
        
        return request.getRemoteAddr();
    }

    /**
     * Check if application is running in development mode.
     * 
     * @return true if in development mode
     */
    private boolean isDevelopmentMode() {
        String profile = System.getProperty("spring.profiles.active");
        return "dev".equals(profile) || "development".equals(profile);
    }
}