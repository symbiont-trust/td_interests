package com.myinterests.backend.dto.notification;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class NotificationDto {
    
    private Long id;
    private String recipientWallet;
    private String senderWallet;
    private String senderHandle;
    private NotificationType type;
    private String content;
    private Long messageId;
    private Long threadId;
    private String threadTitle;
    private boolean isRead;
    private LocalDateTime createdAt;
    
    public enum NotificationType {
        PRIVATE_MESSAGE_REPLY,
        PUBLIC_MESSAGE_REPLY,
        NEW_PRIVATE_MESSAGE,
        CONNECTION_REQUEST,
        CONNECTION_ACCEPTED
    }
}