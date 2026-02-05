package com.mavenbootstrap.security;

import com.auth0.jwt.JWT;
import com.auth0.jwt.algorithms.Algorithm;
import com.auth0.jwt.exceptions.JWTVerificationException;
import com.auth0.jwt.interfaces.DecodedJWT;
import com.auth0.jwt.interfaces.JWTVerifier;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import java.util.Date;

/**
 * Utility class for JWT token operations.
 */
@Component
public class JwtUtil {

    private static final Logger logger = LoggerFactory.getLogger(JwtUtil.class);

    @Value("${jwt.secret}")
    private String secret;

    @Value("${jwt.expiration}")
    private Long expiration;

    @Value("${jwt.refresh-expiration}")
    private Long refreshExpiration;

    @Value("${jwt.issuer}")
    private String issuer;

    /**
     * Generate JWT token for the given username.
     */
    public String generateToken(String username) {
        return generateToken(username, expiration);
    }

    /**
     * Generate refresh token for the given username.
     */
    public String generateRefreshToken(String username) {
        return generateToken(username, refreshExpiration);
    }

    /**
     * Generate JWT token with custom expiration.
     */
    private String generateToken(String username, Long expirationTime) {
        try {
            Algorithm algorithm = Algorithm.HMAC256(secret);
            return JWT.create()
                    .withIssuer(issuer)
                    .withSubject(username)
                    .withIssuedAt(new Date())
                    .withExpiresAt(new Date(System.currentTimeMillis() + expirationTime))
                    .sign(algorithm);
        } catch (Exception e) {
            logger.error("Error generating JWT token for user: {}", username, e);
            throw new RuntimeException("Failed to generate JWT token", e);
        }
    }

    /**
     * Extract username from JWT token.
     */
    public String getUsernameFromToken(String token) {
        try {
            DecodedJWT decodedJWT = verifyToken(token);
            return decodedJWT.getSubject();
        } catch (Exception e) {
            logger.error("Error extracting username from token", e);
            return null;
        }
    }

    /**
     * Validate JWT token.
     */
    public boolean validateToken(String token, String username) {
        try {
            String tokenUsername = getUsernameFromToken(token);
            return (tokenUsername != null && tokenUsername.equals(username) && !isTokenExpired(token));
        } catch (Exception e) {
            logger.error("Error validating token for user: {}", username, e);
            return false;
        }
    }

    /**
     * Check if token is expired.
     */
    public boolean isTokenExpired(String token) {
        try {
            DecodedJWT decodedJWT = verifyToken(token);
            return decodedJWT.getExpiresAt().before(new Date());
        } catch (Exception e) {
            logger.error("Error checking token expiration", e);
            return true;
        }
    }

    /**
     * Verify JWT token and return decoded JWT.
     */
    private DecodedJWT verifyToken(String token) throws JWTVerificationException {
        Algorithm algorithm = Algorithm.HMAC256(secret);
        JWTVerifier verifier = JWT.require(algorithm)
                .withIssuer(issuer)
                .build();
        return verifier.verify(token);
    }

    /**
     * Get expiration time from token.
     */
    public Date getExpirationDateFromToken(String token) {
        try {
            DecodedJWT decodedJWT = verifyToken(token);
            return decodedJWT.getExpiresAt();
        } catch (Exception e) {
            logger.error("Error getting expiration date from token", e);
            return null;
        }
    }

    /**
     * Get issued at time from token.
     */
    public Date getIssuedAtDateFromToken(String token) {
        try {
            DecodedJWT decodedJWT = verifyToken(token);
            return decodedJWT.getIssuedAt();
        } catch (Exception e) {
            logger.error("Error getting issued at date from token", e);
            return null;
        }
    }
}