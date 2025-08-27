package com.myinterests.backend.dto.user;

import lombok.Builder;
import lombok.Data;

import java.util.List;

@Data
@Builder
public class MutualConnectionDto {
    private String walletAddress;
    private String handle;
    private List<UserProfileDto.InterestTagDto> commonInterests;
}