package com.myinterests.backend.service;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.util.concurrent.ConcurrentHashMap;
import java.util.Map;

@Service
@RequiredArgsConstructor
@Slf4j
public class NotificationService {
    
    // In-memory map to track users who have notifications
    // Key: wallet address, Value: boolean indicating if user has notifications
    private final Map<String, Boolean> userNotifications = new ConcurrentHashMap<>();
    
    /**
     * Mark a user as having notifications
     * @param walletAddress the user's wallet address
     */
    public void markUserHasNotifications(String walletAddress) {
        log.debug("Marking user {} as having notifications", walletAddress);
        userNotifications.put(walletAddress, true);
    }
    
    /**
     * Check if a user has notifications
     * @param walletAddress the user's wallet address
     * @return true if user has notifications, false otherwise
     */
    public boolean hasNotifications(String walletAddress) {
        return userNotifications.getOrDefault(walletAddress, false);
    }
    
    /**
     * Clear notifications for a user (called when they view notifications)
     * @param walletAddress the user's wallet address
     */
    public void clearNotifications(String walletAddress) {
        log.debug("Clearing notifications for user {}", walletAddress);
        userNotifications.remove(walletAddress);
    }
    
    /**
     * Get count of users with notifications (for monitoring)
     * @return number of users with pending notifications
     */
    public int getNotificationCount() {
        return (int) userNotifications.values().stream().mapToInt(b -> b ? 1 : 0).sum();
    }
}