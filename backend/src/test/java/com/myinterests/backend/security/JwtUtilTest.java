package com.myinterests.backend.security;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.test.util.ReflectionTestUtils;

import static org.assertj.core.api.Assertions.assertThat;

class JwtUtilTest {

    private JwtUtil jwtUtil;

    @BeforeEach
    void setUp() {
        jwtUtil = new JwtUtil();
        // Set test values using reflection to avoid Spring dependency
        ReflectionTestUtils.setField(jwtUtil, "jwtSecret", "test-secret-key-for-testing-purposes");
        ReflectionTestUtils.setField(jwtUtil, "jwtExpiration", 86400000L); // 24 hours
        ReflectionTestUtils.setField(jwtUtil, "refreshExpiration", 604800000L); // 7 days
    }

    @Test
    void generateToken_WithValidWalletAddress_ShouldReturnToken() {
        // Given
        String walletAddress = "0x1234567890abcdef1234567890abcdef12345678";

        // When
        String token = jwtUtil.generateToken(walletAddress);

        // Then
        assertThat(token).isNotNull();
        assertThat(token).isNotEmpty();
        assertThat(token.split("\\.")).hasSize(3); // JWT has 3 parts separated by dots
    }

    @Test
    void extractWalletAddress_WithValidToken_ShouldReturnWalletAddress() {
        // Given
        String walletAddress = "0x1234567890abcdef1234567890abcdef12345678";
        String token = jwtUtil.generateToken(walletAddress);

        // When
        String extractedAddress = jwtUtil.extractWalletAddress(token);

        // Then
        assertThat(extractedAddress).isEqualTo(walletAddress);
    }

    @Test
    void validateToken_WithValidToken_ShouldReturnTrue() {
        // Given
        String walletAddress = "0x1234567890abcdef1234567890abcdef12345678";
        String token = jwtUtil.generateToken(walletAddress);

        // When
        Boolean isValid = jwtUtil.validateToken(token, walletAddress);

        // Then
        assertThat(isValid).isTrue();
    }

    @Test
    void validateToken_WithWrongWalletAddress_ShouldReturnFalse() {
        // Given
        String walletAddress = "0x1234567890abcdef1234567890abcdef12345678";
        String wrongAddress = "0xabcdef1234567890abcdef1234567890abcdef12";
        String token = jwtUtil.generateToken(walletAddress);

        // When
        Boolean isValid = jwtUtil.validateToken(token, wrongAddress);

        // Then
        assertThat(isValid).isFalse();
    }

    @Test
    void generateRefreshToken_WithValidWalletAddress_ShouldReturnRefreshToken() {
        // Given
        String walletAddress = "0x1234567890abcdef1234567890abcdef12345678";

        // When
        String refreshToken = jwtUtil.generateRefreshToken(walletAddress);

        // Then
        assertThat(refreshToken).isNotNull();
        assertThat(refreshToken).isNotEmpty();
        assertThat(refreshToken.split("\\.")).hasSize(3);
    }

    @Test
    void validateRefreshToken_WithValidRefreshToken_ShouldReturnTrue() {
        // Given
        String walletAddress = "0x1234567890abcdef1234567890abcdef12345678";
        String refreshToken = jwtUtil.generateRefreshToken(walletAddress);

        // When
        Boolean isValid = jwtUtil.validateRefreshToken(refreshToken);

        // Then
        assertThat(isValid).isTrue();
    }

    @Test
    void validateRefreshToken_WithRegularToken_ShouldReturnFalse() {
        // Given
        String walletAddress = "0x1234567890abcdef1234567890abcdef12345678";
        String regularToken = jwtUtil.generateToken(walletAddress);

        // When
        Boolean isValid = jwtUtil.validateRefreshToken(regularToken);

        // Then
        assertThat(isValid).isFalse();
    }

    @Test
    void generateToken_WithProfileApiClientType_ShouldReturnValidToken() {
        // Given
        String clientId = "test-client-id";
        String tokenType = "PROFILE_API_CLIENT";

        // When
        String token = jwtUtil.generateToken(clientId, tokenType);

        // Then
        assertThat(token).isNotNull();
        assertThat(token).isNotEmpty();
        assertThat(jwtUtil.extractSubject(token)).isEqualTo(clientId);
    }

    @Test
    void validateProfileApiToken_WithValidToken_ShouldReturnTrue() {
        // Given
        String clientId = "test-client-id";
        String token = jwtUtil.generateToken(clientId, "PROFILE_API_CLIENT");

        // When
        Boolean isValid = jwtUtil.validateProfileApiToken(token);

        // Then
        assertThat(isValid).isTrue();
    }

    @Test
    void validateProfileApiToken_WithRegularToken_ShouldReturnFalse() {
        // Given
        String walletAddress = "0x1234567890abcdef1234567890abcdef12345678";
        String regularToken = jwtUtil.generateToken(walletAddress);

        // When
        Boolean isValid = jwtUtil.validateProfileApiToken(regularToken);

        // Then
        assertThat(isValid).isFalse();
    }
}