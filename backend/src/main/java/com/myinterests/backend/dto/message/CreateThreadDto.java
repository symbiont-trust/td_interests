package com.myinterests.backend.dto.message;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
public class CreateThreadDto {
    @NotBlank(message = "Recipient wallet address is required")
    private String recipientWallet;
    
    @Size(max = 255, message = "Subject cannot exceed 255 characters")
    private String subject;
    
    @NotBlank(message = "Initial message content is required")
    @Size(max = 10000, message = "Message content cannot exceed 10,000 characters")
    private String initialMessage;
}