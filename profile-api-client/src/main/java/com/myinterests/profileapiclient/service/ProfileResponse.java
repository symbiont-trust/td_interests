package com.myinterests.profileapiclient.service;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class ProfileResponse {
    private boolean success;
    private String profileJson;
    private String profileHash;
    private String signature;
    private String signerAddress;
    private String walletAddress;
    private String error;
}