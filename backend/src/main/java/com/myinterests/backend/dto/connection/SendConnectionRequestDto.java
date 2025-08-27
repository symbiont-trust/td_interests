package com.myinterests.backend.dto.connection;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class SendConnectionRequestDto {
    @NotBlank(message = "Recipient wallet address is required")
    private String recipientWallet;
}