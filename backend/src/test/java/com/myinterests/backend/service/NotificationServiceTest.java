package com.myinterests.backend.service;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

import static org.assertj.core.api.Assertions.assertThat;

class NotificationServiceTest {

    private NotificationService notificationService;

    @BeforeEach
    void setUp() {
        notificationService = new NotificationService();
    }

    @Test
    void hasNotifications_WithNewUser_ShouldReturnFalse() {
        // Given
        String walletAddress = "0x1234567890abcdef1234567890abcdef12345678";

        // When
        boolean result = notificationService.hasNotifications(walletAddress);

        // Then
        assertThat(result).isFalse();
    }

    @Test
    void markUserHasNotifications_ShouldSetNotificationFlag() {
        // Given
        String walletAddress = "0x1234567890abcdef1234567890abcdef12345678";

        // When
        notificationService.markUserHasNotifications(walletAddress);

        // Then
        assertThat(notificationService.hasNotifications(walletAddress)).isTrue();
    }

    @Test
    void clearNotifications_ShouldRemoveNotificationFlag() {
        // Given
        String walletAddress = "0x1234567890abcdef1234567890abcdef12345678";
        notificationService.markUserHasNotifications(walletAddress);
        assertThat(notificationService.hasNotifications(walletAddress)).isTrue();

        // When
        notificationService.clearNotifications(walletAddress);

        // Then
        assertThat(notificationService.hasNotifications(walletAddress)).isFalse();
    }

    @Test
    void getNotificationCount_WithMultipleUsers_ShouldReturnCorrectCount() {
        // Given
        String user1 = "0x1111111111111111111111111111111111111111";
        String user2 = "0x2222222222222222222222222222222222222222";
        String user3 = "0x3333333333333333333333333333333333333333";

        notificationService.markUserHasNotifications(user1);
        notificationService.markUserHasNotifications(user2);
        // user3 has no notifications

        // When
        long count = notificationService.getNotificationCount();

        // Then
        assertThat(count).isEqualTo(2);
    }

    @Test
    void getNotificationCount_WithNoUsers_ShouldReturnZero() {
        // When
        long count = notificationService.getNotificationCount();

        // Then
        assertThat(count).isEqualTo(0);
    }

    @Test
    void markUserHasNotifications_MultipleTimesSameUser_ShouldStillHaveNotifications() {
        // Given
        String walletAddress = "0x1234567890abcdef1234567890abcdef12345678";

        // When
        notificationService.markUserHasNotifications(walletAddress);
        notificationService.markUserHasNotifications(walletAddress);
        notificationService.markUserHasNotifications(walletAddress);

        // Then
        assertThat(notificationService.hasNotifications(walletAddress)).isTrue();
        assertThat(notificationService.getNotificationCount()).isEqualTo(1);
    }
}