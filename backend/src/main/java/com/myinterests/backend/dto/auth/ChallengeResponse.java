package com.myinterests.backend.dto.auth;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class ChallengeResponse {
    private String message;
    private String walletAddress;
}