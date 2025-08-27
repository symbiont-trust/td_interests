package com.myinterests.backend.dto.message;

import com.myinterests.backend.domain.PrivateMessageThread;
import com.myinterests.backend.dto.user.UserProfileDto;
import lombok.Builder;
import lombok.Data;

import java.time.LocalDateTime;
import java.time.ZoneId;

@Data
@Builder
public class PrivateMessageThreadDto {
    private Long id;
    private String user1Wallet;
    private String user2Wallet;
    private String subject;
    private String lastMessageAt;
    private int unreadCount;
    private boolean isArchived;
    private String createdAt;
    private String updatedAt;
    
    // Other user's profile information
    private UserProfileDto otherUserProfile;
    
    public static PrivateMessageThreadDto fromThread(PrivateMessageThread thread, String currentUserWallet) {
        return PrivateMessageThreadDto.builder()
                .id(thread.getId())
                .user1Wallet(thread.getUser1Wallet())
                .user2Wallet(thread.getUser2Wallet())
                .subject(thread.getSubject())
                .lastMessageAt(calendarToString(thread.getLastMessageAt()))
                .unreadCount(thread.getUnreadCountForUser(currentUserWallet))
                .isArchived(thread.isArchivedForUser(currentUserWallet))
                .createdAt(calendarToString(thread.getCreatedAt()))
                .updatedAt(calendarToString(thread.getUpdatedAt()))
                .build();
    }
    
    private static String calendarToString(java.util.Calendar calendar) {
        if (calendar == null) return null;
        return LocalDateTime.ofInstant(calendar.toInstant(), ZoneId.systemDefault()).toString();
    }
}