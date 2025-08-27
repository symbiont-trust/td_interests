package com.myinterests.backend.dto.message;

import com.myinterests.backend.dto.user.UserProfileDto;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PublicMessageThreadDto {
    
    private Long id;
    private String title;
    private String description;
    private String creatorWallet;
    private UserProfileDto creatorProfile;
    private LocalDateTime lastMessageAt;
    private Long messageCount;
    private Boolean isActive;
    private Boolean isFeatured;
    private List<String> interestTags;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}