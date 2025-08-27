package com.myinterests.backend.service;

import com.myinterests.backend.domain.ApiClient;
import com.myinterests.backend.repository.ApiClientRepository;
import com.myinterests.backend.security.JwtUtil;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
@Slf4j
public class ProfileApiAuthService {
    
    private final ApiClientRepository apiClientRepository;
    private final JwtUtil jwtUtil;
    
    public String authenticateClient(String clientId) {
        ApiClient client = apiClientRepository.findByClientId(clientId)
                .orElseThrow(() -> new RuntimeException("Invalid client ID"));
        
        if (!client.getIsActive()) {
            throw new RuntimeException("Client is not active");
        }
        
        // Generate JWT token for the client
        // Using client ID as the subject for profile API tokens
        return jwtUtil.generateToken(clientId, "PROFILE_API_CLIENT");
    }
    
    public boolean isValidClient(String clientId) {
        return apiClientRepository.existsByClientId(clientId);
    }
    
    public ApiClient getClientById(String clientId) {
        return apiClientRepository.findByClientId(clientId)
                .orElseThrow(() -> new RuntimeException("Client not found"));
    }
}