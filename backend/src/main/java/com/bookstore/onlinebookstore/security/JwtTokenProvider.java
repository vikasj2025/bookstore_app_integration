package com.bookstore.onlinebookstore.security;

import io.jsonwebtoken.*;
import io.jsonwebtoken.security.Keys;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import javax.crypto.SecretKey;
import java.nio.charset.StandardCharsets;
import java.util.Date;

/**
 * JWT token provider for generating and validating JWT tokens.
 */
@Component
public class JwtTokenProvider {

    private static final Logger logger = LoggerFactory.getLogger(JwtTokenProvider.class);

    private final SecretKey secretKey;
    private final long accessTokenExpiration;
    private final long refreshTokenExpiration;

    public JwtTokenProvider(
            @Value("${app.jwt.secret}") String secret,
            @Value("${app.jwt.expiration}") long accessTokenExpiration,
            @Value("${app.jwt.refresh-expiration}") long refreshTokenExpiration) {
        
        // Ensure the secret is long enough for HS256
        if (secret.getBytes(StandardCharsets.UTF_8).length < 32) {
            throw new IllegalArgumentException("JWT secret must be at least 32 bytes long");
        }
        
        this.secretKey = Keys.hmacShaKeyFor(secret.getBytes(StandardCharsets.UTF_8));
        this.accessTokenExpiration = accessTokenExpiration;
        this.refreshTokenExpiration = refreshTokenExpiration;
    }

    /**
     * Generate access token for user.
     * 
     * @param username the username (email)
     * @return JWT access token
     */
    public String generateAccessToken(String username) {
        Date now = new Date();
        Date expiryDate = new Date(now.getTime() + accessTokenExpiration);

        return Jwts.builder()
                .subject(username)
                .issuedAt(now)
                .expiration(expiryDate)
                .claim("type", "access")
                .signWith(secretKey, Jwts.SIG.HS256)
                .compact();
    }

    /**
     * Generate refresh token for user.
     * 
     * @param username the username (email)
     * @return JWT refresh token
     */
    public String generateRefreshToken(String username) {
        Date now = new Date();
        Date expiryDate = new Date(now.getTime() + refreshTokenExpiration);

        return Jwts.builder()
                .subject(username)
                .issuedAt(now)
                .expiration(expiryDate)
                .claim("type", "refresh")
                .signWith(secretKey, Jwts.SIG.HS256)
                .compact();
    }

    /**
     * Get username from access token.
     * 
     * @param token the access token
     * @return username (email)
     */
    public String getUsernameFromAccessToken(String token) {
        Claims claims = parseToken(token);
        validateTokenType(claims, "access");
        return claims.getSubject();
    }

    /**
     * Get username from refresh token.
     * 
     * @param token the refresh token
     * @return username (email)
     */
    public String getUsernameFromRefreshToken(String token) {
        Claims claims = parseToken(token);
        validateTokenType(claims, "refresh");
        return claims.getSubject();
    }

    /**
     * Validate access token.
     * 
     * @param token the access token
     * @return true if valid, false otherwise
     */
    public boolean validateAccessToken(String token) {
        try {
            Claims claims = parseToken(token);
            validateTokenType(claims, "access");
            return !isTokenExpired(claims);
        } catch (Exception e) {
            logger.debug("Access token validation failed: {}", e.getMessage());
            return false;
        }
    }

    /**
     * Validate refresh token.
     * 
     * @param token the refresh token
     * @return true if valid, false otherwise
     */
    public boolean validateRefreshToken(String token) {
        try {
            Claims claims = parseToken(token);
            validateTokenType(claims, "refresh");
            return !isTokenExpired(claims);
        } catch (Exception e) {
            logger.debug("Refresh token validation failed: {}", e.getMessage());
            return false;
        }
    }

    /**
     * Get access token expiration time in milliseconds.
     * 
     * @return expiration time
     */
    public long getAccessTokenExpirationTime() {
        return accessTokenExpiration;
    }

    /**
     * Get refresh token expiration time in milliseconds.
     * 
     * @return expiration time
     */
    public long getRefreshTokenExpirationTime() {
        return refreshTokenExpiration;
    }

    /**
     * Parse JWT token and extract claims.
     * 
     * @param token the JWT token
     * @return claims
     * @throws JwtException if token is invalid
     */
    private Claims parseToken(String token) {
        try {
            return Jwts.parser()
                    .verifyWith(secretKey)
                    .build()
                    .parseSignedClaims(token)
                    .getPayload();
        } catch (ExpiredJwtException e) {
            logger.debug("JWT token is expired: {}", e.getMessage());
            throw new JwtException("Token is expired", e);
        } catch (UnsupportedJwtException e) {
            logger.debug("JWT token is unsupported: {}", e.getMessage());
            throw new JwtException("Token is unsupported", e);
        } catch (MalformedJwtException e) {
            logger.debug("JWT token is malformed: {}", e.getMessage());
            throw new JwtException("Token is malformed", e);
        } catch (SecurityException e) {
            logger.debug("JWT signature validation failed: {}", e.getMessage());
            throw new JwtException("Token signature is invalid", e);
        } catch (IllegalArgumentException e) {
            logger.debug("JWT token is null or empty: {}", e.getMessage());
            throw new JwtException("Token is null or empty", e);
        }
    }

    /**
     * Check if token is expired.
     * 
     * @param claims the token claims
     * @return true if expired, false otherwise
     */
    private boolean isTokenExpired(Claims claims) {
        Date expiration = claims.getExpiration();
        return expiration.before(new Date());
    }

    /**
     * Validate token type.
     * 
     * @param claims the token claims
     * @param expectedType the expected token type
     * @throws JwtException if token type is invalid
     */
    private void validateTokenType(Claims claims, String expectedType) {
        String tokenType = claims.get("type", String.class);
        if (!expectedType.equals(tokenType)) {
            throw new JwtException("Invalid token type. Expected: " + expectedType + ", Found: " + tokenType);
        }
    }

    /**
     * Extract token from Authorization header.
     * 
     * @param authHeader the Authorization header value
     * @return JWT token or null if not found
     */
    public String extractTokenFromHeader(String authHeader) {
        if (authHeader != null && authHeader.startsWith("Bearer ")) {
            return authHeader.substring(7);
        }
        return null;
    }
}