package com.myinterests.backend.dto.message;

import com.myinterests.backend.domain.Message;
import com.myinterests.backend.dto.user.UserProfileDto;
import lombok.Builder;
import lombok.Data;

import java.time.LocalDateTime;
import java.time.ZoneId;

@Data
@Builder
public class MessageDto {
    private Long id;
    private Long threadId;
    private String threadType;
    private String senderWallet;
    private String content;
    private Long parentMessageId;
    private String tags;
    private String createdAt;
    private String updatedAt;
    
    // Computed fields
    private long replyCount;
    private UserProfileDto senderProfile;
    
    public static MessageDto fromMessage(Message message) {
        return MessageDto.builder()
                .id(message.getId())
                .threadId(message.getThreadId())
                .threadType(message.getThreadType().name())
                .senderWallet(message.getSenderWallet())
                .content(message.getContent())
                .parentMessageId(message.getParentMessageId())
                .tags(message.getTags())
                .createdAt(calendarToString(message.getCreatedAt()))
                .updatedAt(calendarToString(message.getUpdatedAt()))
                .build();
    }
    
    private static String calendarToString(java.util.Calendar calendar) {
        if (calendar == null) return null;
        return LocalDateTime.ofInstant(calendar.toInstant(), ZoneId.systemDefault()).toString();
    }
}