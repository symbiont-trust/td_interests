package com.myinterests.backend.dto.user;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

import java.util.List;
import java.util.Set;

@Data
public class UpdateProfileRequest {
    @NotBlank(message = "Handle is required")
    private String handle;
    
    private Long countryId;
    private List<String> locationTags;
    private Set<Long> interestIds;
}