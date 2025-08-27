package com.myinterests.backend.controller;

import com.myinterests.backend.service.ProfileApiAuthService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;
import java.util.HashMap;

@RestController
@RequestMapping("/api/profile-auth")
@RequiredArgsConstructor
@Slf4j
public class ProfileApiAuthController {
    
    private final ProfileApiAuthService profileApiAuthService;
    
    @PostMapping("/authenticate")
    public ResponseEntity<Map<String, Object>> authenticateClient(@RequestBody Map<String, String> request) {
        try {
            String clientId = request.get("client_id");
            
            if (clientId == null || clientId.trim().isEmpty()) {
                return ResponseEntity.badRequest()
                        .body(Map.of("error", "client_id is required"));
            }
            
            String jwtToken = profileApiAuthService.authenticateClient(clientId);
            
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("access_token", jwtToken);
            response.put("token_type", "Bearer");
            response.put("client_id", clientId);
            
            return ResponseEntity.ok(response);
        } catch (RuntimeException e) {
            log.error("Profile API authentication failed", e);
            return ResponseEntity.status(401)
                    .body(Map.of("error", "Authentication failed", "message", e.getMessage()));
        } catch (Exception e) {
            log.error("Unexpected error during profile API authentication", e);
            return ResponseEntity.status(500)
                    .body(Map.of("error", "Internal server error"));
        }
    }
}