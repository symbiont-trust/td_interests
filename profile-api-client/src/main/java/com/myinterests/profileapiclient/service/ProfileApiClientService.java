package com.myinterests.profileapiclient.service;

import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpMethod;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.util.Map;
import java.util.HashMap;

@Service
@RequiredArgsConstructor
@Slf4j
public class ProfileApiClientService {
    
    private final RestTemplate restTemplate;
    private final ObjectMapper objectMapper;
    private final ProfileAuthService profileAuthService;
    
    @Value("${profile.api.base-url}")
    private String baseUrl;
    
    public ProfileResponse getProfile(String walletAddress) {
        try {
            // Get authentication token
            String token = profileAuthService.getAuthToken();
            
            // Prepare headers
            HttpHeaders headers = new HttpHeaders();
            headers.setBearerAuth(token);
            
            HttpEntity<String> entity = new HttpEntity<>(headers);
            
            // Make API call
            String url = baseUrl + "/api/profile/" + walletAddress;
            ResponseEntity<Map> response = restTemplate.exchange(
                url, 
                HttpMethod.GET, 
                entity, 
                Map.class
            );
            
            if (response.getStatusCode().is2xxSuccessful()) {
                Map<String, Object> responseBody = response.getBody();
                
                return ProfileResponse.builder()
                    .profileJson((String) responseBody.get("profile"))
                    .profileHash((String) responseBody.get("profile_hash"))
                    .signature((String) responseBody.get("signature"))
                    .signerAddress((String) responseBody.get("signer_address"))
                    .walletAddress((String) responseBody.get("wallet_address"))
                    .success(true)
                    .build();
            } else {
                log.error("Profile API returned non-success status: {}", response.getStatusCode());
                return ProfileResponse.builder()
                    .success(false)
                    .error("API returned status: " + response.getStatusCode())
                    .build();
            }
            
        } catch (Exception e) {
            log.error("Failed to retrieve profile for wallet: {}", walletAddress, e);
            return ProfileResponse.builder()
                .success(false)
                .error("Failed to retrieve profile: " + e.getMessage())
                .build();
        }
    }
    
    public boolean verifySignature(String profileJson, String signature, String signerAddress) {
        try {
            // This is a simplified verification - in a real implementation,
            // you would use web3j to verify the ECDSA signature
            log.info("Verifying signature for profile from signer: {}", signerAddress);
            
            // For demonstration purposes, we'll just check that all fields are present
            return profileJson != null && 
                   signature != null && 
                   signerAddress != null && 
                   signature.startsWith("0x") && 
                   signerAddress.startsWith("0x");
                   
        } catch (Exception e) {
            log.error("Error verifying signature", e);
            return false;
        }
    }
    
    public Map<String, Object> parseProfile(String profileJson) {
        try {
            return objectMapper.readValue(profileJson, Map.class);
        } catch (Exception e) {
            log.error("Failed to parse profile JSON", e);
            return new HashMap<>();
        }
    }
}