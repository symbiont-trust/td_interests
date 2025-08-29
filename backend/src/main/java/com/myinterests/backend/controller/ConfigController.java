package com.myinterests.backend.controller;

import com.myinterests.backend.config.AppProperties;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;

@RestController
@RequestMapping("/api/config")
@RequiredArgsConstructor
@Slf4j
public class ConfigController {

    private final AppProperties appProperties;

    @GetMapping("/test")
    public ResponseEntity<Map<String, String>> test() {
        log.info("ConfigController: test() called");
        return ResponseEntity.ok(Map.of("message", "ConfigController is working"));
    }

    @GetMapping("/admin-email")
    public ResponseEntity<Map<String, String>> getAdminEmail() {
        log.info("ConfigController: getAdminEmail() called");
        try {
            String email = appProperties.getAdmin().getEmail();
            log.info("ConfigController: Retrieved admin email: {}", email);
            return ResponseEntity.ok(Map.of("adminEmail", email));
        } catch (Exception e) {
            log.error("ConfigController: Error retrieving admin email", e);
            return ResponseEntity.ok(Map.of("adminEmail", "admin@myinterests.com"));
        }
    }
}