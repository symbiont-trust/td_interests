package com.myinterests.backend.dto.message;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CreatePublicMessageDto {
    
    @NotBlank(message = "Content is required")
    @Size(min = 1, max = 10000, message = "Message must be between 1 and 10000 characters")
    private String content;
    
    private Long parentMessageId;
    
    @Size(max = 1000, message = "Tags cannot exceed 1000 characters")
    private String tags;
}