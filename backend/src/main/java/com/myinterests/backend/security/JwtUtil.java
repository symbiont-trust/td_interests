package com.myinterests.backend.security;

import io.jsonwebtoken.*;
import io.jsonwebtoken.security.Keys;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import javax.crypto.SecretKey;
import java.util.Date;
import java.util.HashMap;
import java.util.Map;
import java.util.function.Function;

@Component
@Slf4j
public class JwtUtil {

    @Value("${jwt.secret:myinterests-secret-key-for-jwt-tokens-please-change-in-production}")
    private String jwtSecret;

    @Value("${jwt.expiration:86400000}") // 24 hours in milliseconds
    private Long jwtExpiration;

    @Value("${jwt.refresh-expiration:604800000}") // 7 days in milliseconds
    private Long refreshExpiration;

    private SecretKey getSigningKey() {
        return Keys.hmacShaKeyFor(jwtSecret.getBytes());
    }

    public String extractWalletAddress(String token) {
        return extractClaim(token, Claims::getSubject);
    }

    public Date extractExpiration(String token) {
        return extractClaim(token, Claims::getExpiration);
    }

    public <T> T extractClaim(String token, Function<Claims, T> claimsResolver) {
        final Claims claims = extractAllClaims(token);
        return claimsResolver.apply(claims);
    }

    private Claims extractAllClaims(String token) {
        return Jwts.parserBuilder()
                .setSigningKey(getSigningKey())
                .build()
                .parseClaimsJws(token)
                .getBody();
    }

    private Boolean isTokenExpired(String token) {
        return extractExpiration(token).before(new Date());
    }

    public String generateToken(String walletAddress) {
        Map<String, Object> claims = new HashMap<>();
        return createToken(claims, walletAddress, jwtExpiration);
    }

    public String generateRefreshToken(String walletAddress) {
        Map<String, Object> claims = new HashMap<>();
        claims.put("type", "refresh");
        return createToken(claims, walletAddress, refreshExpiration);
    }
    
    public String generateToken(String subject, String tokenType) {
        Map<String, Object> claims = new HashMap<>();
        claims.put("type", tokenType);
        return createToken(claims, subject, jwtExpiration);
    }

    private String createToken(Map<String, Object> claims, String subject, Long expiration) {
        return Jwts.builder()
                .setClaims(claims)
                .setSubject(subject)
                .setIssuedAt(new Date(System.currentTimeMillis()))
                .setExpiration(new Date(System.currentTimeMillis() + expiration))
                .signWith(getSigningKey(), SignatureAlgorithm.HS256)
                .compact();
    }

    public Boolean validateToken(String token, String walletAddress) {
        try {
            final String extractedWalletAddress = extractWalletAddress(token);
            return (extractedWalletAddress.equals(walletAddress) && !isTokenExpired(token));
        } catch (JwtException | IllegalArgumentException e) {
            log.error("JWT validation failed: {}", e.getMessage());
            return false;
        }
    }

    public Boolean validateRefreshToken(String token) {
        try {
            Claims claims = extractAllClaims(token);
            return "refresh".equals(claims.get("type")) && !isTokenExpired(token);
        } catch (JwtException | IllegalArgumentException e) {
            log.error("Refresh token validation failed: {}", e.getMessage());
            return false;
        }
    }
    
    public Boolean validateProfileApiToken(String token) {
        try {
            Claims claims = extractAllClaims(token);
            return "PROFILE_API_CLIENT".equals(claims.get("type")) && !isTokenExpired(token);
        } catch (JwtException | IllegalArgumentException e) {
            log.error("Profile API token validation failed: {}", e.getMessage());
            return false;
        }
    }
    
    public String extractSubject(String token) {
        return extractClaim(token, Claims::getSubject);
    }
}