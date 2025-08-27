package com.myinterests.profileapiclient.service;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.time.LocalDateTime;
import java.util.Map;
import java.util.HashMap;

@Service
@RequiredArgsConstructor
@Slf4j
public class ProfileAuthService {
    
    private final RestTemplate restTemplate;
    
    @Value("${profile.api.base-url}")
    private String baseUrl;
    
    @Value("${profile.api.client-id}")
    private String clientId;
    
    private String cachedToken;
    private LocalDateTime tokenExpiry;
    
    public String getAuthToken() {
        if (cachedToken != null && tokenExpiry != null && LocalDateTime.now().isBefore(tokenExpiry)) {
            return cachedToken;
        }
        
        return authenticateAndCacheToken();
    }
    
    private String authenticateAndCacheToken() {
        try {
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);
            
            Map<String, String> requestBody = new HashMap<>();
            requestBody.put("client_id", clientId);
            
            HttpEntity<Map<String, String>> entity = new HttpEntity<>(requestBody, headers);
            
            String url = baseUrl + "/api/profile-auth/authenticate";
            ResponseEntity<Map> response = restTemplate.postForEntity(url, entity, Map.class);
            
            if (response.getStatusCode().is2xxSuccessful()) {
                Map<String, Object> responseBody = response.getBody();
                String token = (String) responseBody.get("access_token");
                
                // Cache token for 23 hours (assuming 24h expiry)
                cachedToken = token;
                tokenExpiry = LocalDateTime.now().plusHours(23);
                
                log.info("Successfully authenticated profile API client: {}", clientId);
                return token;
            } else {
                throw new RuntimeException("Authentication failed with status: " + response.getStatusCode());
            }
            
        } catch (Exception e) {
            log.error("Failed to authenticate profile API client: {}", clientId, e);
            throw new RuntimeException("Authentication failed", e);
        }
    }
    
    public void clearTokenCache() {
        cachedToken = null;
        tokenExpiry = null;
    }
}