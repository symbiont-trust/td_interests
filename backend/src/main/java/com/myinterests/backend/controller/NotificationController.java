package com.myinterests.backend.controller;

import com.myinterests.backend.service.NotificationService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/notifications")
@RequiredArgsConstructor
@Slf4j
public class NotificationController {

    private final NotificationService notificationService;

    @GetMapping("/status")
    public ResponseEntity<Map<String, Object>> getNotificationStatus(Authentication authentication) {
        String walletAddress = authentication.getName();
        boolean hasNotifications = notificationService.hasNotifications(walletAddress);
        
        Map<String, Object> response = new HashMap<>();
        response.put("hasNotifications", hasNotifications);
        response.put("walletAddress", walletAddress);
        
        return ResponseEntity.ok(response);
    }

    @PostMapping("/clear")
    public ResponseEntity<Map<String, String>> clearNotifications(Authentication authentication) {
        String walletAddress = authentication.getName();
        notificationService.clearNotifications(walletAddress);
        
        Map<String, String> response = new HashMap<>();
        response.put("status", "notifications_cleared");
        response.put("walletAddress", walletAddress);
        
        return ResponseEntity.ok(response);
    }

    @GetMapping("/stats")
    public ResponseEntity<Map<String, Object>> getNotificationStats() {
        Map<String, Object> stats = new HashMap<>();
        stats.put("totalUsersWithNotifications", notificationService.getNotificationCount());
        
        return ResponseEntity.ok(stats);
    }
}