package com.bookstore.security;

import io.jsonwebtoken.*;
import io.jsonwebtoken.security.Keys;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.stereotype.Component;

import javax.crypto.SecretKey;
import java.util.Date;
import java.util.HashMap;
import java.util.Map;
import java.util.function.Function;

/**
 * Utility class for JWT token operations.
 * 
 * This class provides methods for generating, parsing, and validating JWT tokens
 * used for authentication in the Online Bookstore application.
 */
@Component
public class JwtUtil {

    private static final Logger logger = LoggerFactory.getLogger(JwtUtil.class);

    @Value("${app.jwt.secret}")
    private String jwtSecret;

    @Value("${app.jwt.expiration}")
    private Long jwtExpiration;

    @Value("${app.jwt.refresh-expiration}")
    private Long refreshExpiration;

    /**
     * Get the signing key for JWT tokens.
     * 
     * @return SecretKey for signing tokens
     */
    private SecretKey getSigningKey() {
        return Keys.hmacShaKeyFor(jwtSecret.getBytes());
    }

    /**
     * Extract username from JWT token.
     * 
     * @param token JWT token
     * @return username from token
     */
    public String extractUsername(String token) {
        return extractClaim(token, Claims::getSubject);
    }

    /**
     * Extract expiration date from JWT token.
     * 
     * @param token JWT token
     * @return expiration date
     */
    public Date extractExpiration(String token) {
        return extractClaim(token, Claims::getExpiration);
    }

    /**
     * Extract a specific claim from JWT token.
     * 
     * @param token JWT token
     * @param claimsResolver function to extract claim
     * @param <T> type of claim
     * @return extracted claim
     */
    public <T> T extractClaim(String token, Function<Claims, T> claimsResolver) {
        final Claims claims = extractAllClaims(token);
        return claimsResolver.apply(claims);
    }

    /**
     * Extract all claims from JWT token.
     * 
     * @param token JWT token
     * @return all claims
     */
    private Claims extractAllClaims(String token) {
        try {
            return Jwts.parserBuilder()
                    .setSigningKey(getSigningKey())
                    .build()
                    .parseClaimsJws(token)
                    .getBody();
        } catch (JwtException e) {
            logger.error("Failed to parse JWT token: {}", e.getMessage());
            throw e;
        }
    }

    /**
     * Check if JWT token is expired.
     * 
     * @param token JWT token
     * @return true if token is expired
     */
    public Boolean isTokenExpired(String token) {
        try {
            return extractExpiration(token).before(new Date());
        } catch (JwtException e) {
            logger.warn("Token expiration check failed: {}", e.getMessage());
            return true;
        }
    }

    /**
     * Generate JWT token for user.
     * 
     * @param userDetails user details
     * @return generated JWT token
     */
    public String generateToken(UserDetails userDetails) {
        Map<String, Object> claims = new HashMap<>();
        
        // Add user roles to claims
        claims.put("roles", userDetails.getAuthorities().stream()
                .map(authority -> authority.getAuthority())
                .toList());
        
        return createToken(claims, userDetails.getUsername(), jwtExpiration);
    }

    /**
     * Generate refresh token for user.
     * 
     * @param userDetails user details
     * @return generated refresh token
     */
    public String generateRefreshToken(UserDetails userDetails) {
        Map<String, Object> claims = new HashMap<>();
        claims.put("type", "refresh");
        
        return createToken(claims, userDetails.getUsername(), refreshExpiration);
    }

    /**
     * Create JWT token with claims and expiration.
     * 
     * @param claims token claims
     * @param subject token subject (username)
     * @param expiration expiration time in milliseconds
     * @return created JWT token
     */
    private String createToken(Map<String, Object> claims, String subject, Long expiration) {
        Date now = new Date();
        Date expiryDate = new Date(now.getTime() + expiration);
        
        return Jwts.builder()
                .setClaims(claims)
                .setSubject(subject)
                .setIssuedAt(now)
                .setExpiration(expiryDate)
                .signWith(getSigningKey(), SignatureAlgorithm.HS256)
                .compact();
    }

    /**
     * Validate JWT token against user details.
     * 
     * @param token JWT token
     * @param userDetails user details
     * @return true if token is valid
     */
    public Boolean validateToken(String token, UserDetails userDetails) {
        try {
            final String username = extractUsername(token);
            return (username.equals(userDetails.getUsername()) && !isTokenExpired(token));
        } catch (JwtException e) {
            logger.warn("Token validation failed: {}", e.getMessage());
            return false;
        }
    }

    /**
     * Validate JWT token format and signature.
     * 
     * @param token JWT token
     * @return true if token is valid
     */
    public Boolean validateToken(String token) {
        try {
            Jwts.parserBuilder()
                    .setSigningKey(getSigningKey())
                    .build()
                    .parseClaimsJws(token);
            return true;
        } catch (MalformedJwtException e) {
            logger.error("Invalid JWT token: {}", e.getMessage());
        } catch (ExpiredJwtException e) {
            logger.error("JWT token is expired: {}", e.getMessage());
        } catch (UnsupportedJwtException e) {
            logger.error("JWT token is unsupported: {}", e.getMessage());
        } catch (IllegalArgumentException e) {
            logger.error("JWT claims string is empty: {}", e.getMessage());
        } catch (JwtException e) {
            logger.error("JWT token validation failed: {}", e.getMessage());
        }
        return false;
    }

    /**
     * Get token type from claims.
     * 
     * @param token JWT token
     * @return token type (access or refresh)
     */
    public String getTokenType(String token) {
        try {
            Claims claims = extractAllClaims(token);
            return claims.get("type", String.class);
        } catch (JwtException e) {
            logger.warn("Failed to extract token type: {}", e.getMessage());
            return null;
        }
    }

    /**
     * Check if token is a refresh token.
     * 
     * @param token JWT token
     * @return true if token is a refresh token
     */
    public Boolean isRefreshToken(String token) {
        return "refresh".equals(getTokenType(token));
    }

    /**
     * Get remaining time until token expiration.
     * 
     * @param token JWT token
     * @return remaining time in milliseconds
     */
    public Long getTokenRemainingTime(String token) {
        try {
            Date expiration = extractExpiration(token);
            return expiration.getTime() - System.currentTimeMillis();
        } catch (JwtException e) {
            logger.warn("Failed to get token remaining time: {}", e.getMessage());
            return 0L;
        }
    }

    /**
     * Extract user ID from token if present in claims.
     * 
     * @param token JWT token
     * @return user ID if present
     */
    public String extractUserId(String token) {
        try {
            Claims claims = extractAllClaims(token);
            return claims.get("userId", String.class);
        } catch (JwtException e) {
            logger.warn("Failed to extract user ID: {}", e.getMessage());
            return null;
        }
    }

    /**
     * Create token with additional user ID claim.
     * 
     * @param userDetails user details
     * @param userId user ID to include in token
     * @return generated JWT token with user ID
     */
    public String generateTokenWithUserId(UserDetails userDetails, String userId) {
        Map<String, Object> claims = new HashMap<>();
        
        // Add user roles to claims
        claims.put("roles", userDetails.getAuthorities().stream()
                .map(authority -> authority.getAuthority())
                .toList());
        
        // Add user ID to claims
        claims.put("userId", userId);
        
        return createToken(claims, userDetails.getUsername(), jwtExpiration);
    }
}