package com.myinterests.backend.dto.auth;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.util.List;
import java.util.Set;

@Data
public class RegisterRequest {
    @NotBlank(message = "Wallet address is required")
    private String walletAddress;

    @NotBlank(message = "Handle is required")
    private String handle;

    @NotBlank(message = "Signature is required")
    private String signature;

    @NotBlank(message = "Message is required")
    private String message;

    private Long countryId;
    private List<String> locationTags;

    @NotNull(message = "At least one interest is required")
    private Set<Long> interestIds;
}