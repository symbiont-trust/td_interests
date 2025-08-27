package com.myinterests.backend.dto.message;

import com.myinterests.backend.dto.user.UserProfileDto;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PublicMessageDto {
    
    private Long id;
    private Long threadId;
    private String senderWallet;
    private UserProfileDto senderProfile;
    private String content;
    private Long parentMessageId;
    private String tags;
    private Long replyCount;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}