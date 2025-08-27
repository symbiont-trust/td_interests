package com.myinterests.backend.controller;

import com.myinterests.backend.service.ProfileService;
import com.myinterests.backend.service.SignatureService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.Map;
import java.util.HashMap;

@RestController
@RequestMapping("/api/profile")
@RequiredArgsConstructor
@Slf4j
public class ProfileApiController {
    
    private final ProfileService profileService;
    private final SignatureService signatureService;
    
    @GetMapping("/{walletAddress}")
    public ResponseEntity<Map<String, Object>> getProfile(
            @PathVariable String walletAddress, 
            Authentication authentication) {
        
        try {
            // Validate that the requester is an authenticated API client
            if (authentication == null || !authentication.isAuthenticated()) {
                return ResponseEntity.status(401)
                        .body(Map.of("error", "Authentication required"));
            }
            
            // Generate profile JSON
            String profileJson = profileService.generateProfileJson(walletAddress);
            
            // Generate hash of the profile
            String profileHash = profileService.generateProfileHash(profileJson);
            
            // Generate signature of the profile JSON
            String signature = signatureService.generateSignature(profileJson);
            
            // Get the signer address for verification
            String signerAddress = signatureService.getSignerAddress();
            
            Map<String, Object> response = new HashMap<>();
            response.put("profile", profileJson);
            response.put("profile_hash", profileHash);
            response.put("signature", signature);
            response.put("signer_address", signerAddress);
            response.put("wallet_address", walletAddress);
            
            log.info("Profile retrieved for wallet: {} by client: {}", 
                    walletAddress, authentication.getName());
            
            return ResponseEntity.ok(response);
            
        } catch (RuntimeException e) {
            log.error("Failed to retrieve profile for wallet: {}", walletAddress, e);
            return ResponseEntity.status(404)
                    .body(Map.of("error", "Profile not found", "message", e.getMessage()));
        } catch (Exception e) {
            log.error("Unexpected error retrieving profile for wallet: {}", walletAddress, e);
            return ResponseEntity.status(500)
                    .body(Map.of("error", "Internal server error"));
        }
    }
}