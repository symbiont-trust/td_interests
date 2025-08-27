package com.myinterests.profileapiclient.controller;

import com.myinterests.profileapiclient.service.ProfileApiClientService;
import com.myinterests.profileapiclient.service.ProfileResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;
import java.util.HashMap;

@RestController
@RequestMapping("/example")
@RequiredArgsConstructor
@Slf4j
public class ExampleController {
    
    private final ProfileApiClientService profileApiClientService;
    
    @GetMapping("/profile/{walletAddress}")
    public ResponseEntity<Map<String, Object>> getProfileExample(@PathVariable String walletAddress) {
        try {
            // Get profile from the API
            ProfileResponse profileResponse = profileApiClientService.getProfile(walletAddress);
            
            if (!profileResponse.isSuccess()) {
                return ResponseEntity.badRequest()
                        .body(Map.of("error", profileResponse.getError()));
            }
            
            // Verify the signature
            boolean signatureValid = profileApiClientService.verifySignature(
                profileResponse.getProfileJson(),
                profileResponse.getSignature(),
                profileResponse.getSignerAddress()
            );
            
            // Parse the profile JSON
            Map<String, Object> profileData = profileApiClientService.parseProfile(profileResponse.getProfileJson());
            
            // Build response
            Map<String, Object> response = new HashMap<>();
            response.put("wallet_address", walletAddress);
            response.put("profile_data", profileData);
            response.put("profile_hash", profileResponse.getProfileHash());
            response.put("signature_valid", signatureValid);
            response.put("signer_address", profileResponse.getSignerAddress());
            
            log.info("Successfully retrieved and verified profile for wallet: {}", walletAddress);
            
            return ResponseEntity.ok(response);
            
        } catch (Exception e) {
            log.error("Error in profile example for wallet: {}", walletAddress, e);
            return ResponseEntity.status(500)
                    .body(Map.of("error", "Internal server error", "message", e.getMessage()));
        }
    }
}