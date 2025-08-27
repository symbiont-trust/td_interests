package com.myinterests.backend.controller;

import com.myinterests.backend.security.JwtUtil;
import com.myinterests.backend.security.WalletSignatureVerifier;
import com.myinterests.backend.service.UserService;
import com.myinterests.backend.dto.auth.*;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import jakarta.validation.Valid;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
@Slf4j
public class AuthController {

    private final UserService userService;
    private final WalletSignatureVerifier signatureVerifier;
    private final JwtUtil jwtUtil;

    @PostMapping("/register")
    public ResponseEntity<AuthResponse> register(@Valid @RequestBody RegisterRequest request) {
        try {
            // Verify wallet signature
            if (!signatureVerifier.verifySignature(request.getWalletAddress(), request.getMessage(), request.getSignature())) {
                return ResponseEntity.badRequest()
                    .body(AuthResponse.builder()
                        .success(false)
                        .message("Invalid wallet signature")
                        .build());
            }

            // Create user
            var user = userService.createUser(request);

            // Generate tokens
            String accessToken = jwtUtil.generateToken(user.getWalletAddress());
            String refreshToken = jwtUtil.generateRefreshToken(user.getWalletAddress());

            return ResponseEntity.ok(AuthResponse.builder()
                .success(true)
                .message("User registered successfully")
                .accessToken(accessToken)
                .refreshToken(refreshToken)
                .walletAddress(user.getWalletAddress())
                .handle(user.getHandle())
                .build());

        } catch (Exception e) {
            log.error("Registration failed for wallet {}: {}", request.getWalletAddress(), e.getMessage());
            return ResponseEntity.badRequest()
                .body(AuthResponse.builder()
                    .success(false)
                    .message(e.getMessage())
                    .build());
        }
    }

    @PostMapping("/login")
    public ResponseEntity<AuthResponse> login(@Valid @RequestBody LoginRequest request) {
        try {
            // Verify wallet signature
            if (!signatureVerifier.verifySignature(request.getWalletAddress(), request.getMessage(), request.getSignature())) {
                return ResponseEntity.badRequest()
                    .body(AuthResponse.builder()
                        .success(false)
                        .message("Invalid wallet signature")
                        .build());
            }

            // Get user
            var user = userService.getUserByWalletAddress(request.getWalletAddress());
            if (user == null) {
                return ResponseEntity.badRequest()
                    .body(AuthResponse.builder()
                        .success(false)
                        .message("User not found. Please register first.")
                        .build());
            }

            // Generate tokens
            String accessToken = jwtUtil.generateToken(user.getWalletAddress());
            String refreshToken = jwtUtil.generateRefreshToken(user.getWalletAddress());

            return ResponseEntity.ok(AuthResponse.builder()
                .success(true)
                .message("Login successful")
                .accessToken(accessToken)
                .refreshToken(refreshToken)
                .walletAddress(user.getWalletAddress())
                .handle(user.getHandle())
                .build());

        } catch (Exception e) {
            log.error("Login failed for wallet {}: {}", request.getWalletAddress(), e.getMessage());
            return ResponseEntity.badRequest()
                .body(AuthResponse.builder()
                    .success(false)
                    .message("Login failed")
                    .build());
        }
    }

    @PostMapping("/refresh")
    public ResponseEntity<AuthResponse> refresh(@Valid @RequestBody RefreshRequest request) {
        try {
            if (!jwtUtil.validateRefreshToken(request.getRefreshToken())) {
                return ResponseEntity.badRequest()
                    .body(AuthResponse.builder()
                        .success(false)
                        .message("Invalid or expired refresh token")
                        .build());
            }

            String walletAddress = jwtUtil.extractWalletAddress(request.getRefreshToken());
            String newAccessToken = jwtUtil.generateToken(walletAddress);
            String newRefreshToken = jwtUtil.generateRefreshToken(walletAddress);

            return ResponseEntity.ok(AuthResponse.builder()
                .success(true)
                .message("Token refreshed successfully")
                .accessToken(newAccessToken)
                .refreshToken(newRefreshToken)
                .walletAddress(walletAddress)
                .build());

        } catch (Exception e) {
            log.error("Token refresh failed: {}", e.getMessage());
            return ResponseEntity.badRequest()
                .body(AuthResponse.builder()
                    .success(false)
                    .message("Token refresh failed")
                    .build());
        }
    }

    @GetMapping("/challenge/{walletAddress}")
    public ResponseEntity<ChallengeResponse> getChallenge(@PathVariable String walletAddress) {
        String message = signatureVerifier.generateSignatureMessage(walletAddress);
        return ResponseEntity.ok(ChallengeResponse.builder()
            .message(message)
            .walletAddress(walletAddress)
            .build());
    }
}