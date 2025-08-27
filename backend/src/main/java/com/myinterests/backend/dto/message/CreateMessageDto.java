package com.myinterests.backend.dto.message;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
public class CreateMessageDto {
    @NotNull(message = "Thread ID is required")
    private Long threadId;
    
    @NotBlank(message = "Content is required")
    @Size(max = 10000, message = "Message content cannot exceed 10,000 characters")
    private String content;
    
    private Long parentMessageId; // For replies
    
    @Size(max = 1000, message = "Tags cannot exceed 1,000 characters")
    private String tags; // For public messages
}