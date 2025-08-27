package com.myinterests.backend.dto.message;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.Set;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CreatePublicThreadDto {
    
    @NotBlank(message = "Title is required")
    @Size(min = 3, max = 255, message = "Title must be between 3 and 255 characters")
    private String title;
    
    @Size(max = 5000, message = "Description cannot exceed 5000 characters")
    private String description;
    
    @NotNull(message = "Interest tags are required")
    @Size(min = 1, message = "At least one interest tag is required")
    private Set<String> interestTags;
    
    @NotBlank(message = "Initial message is required")
    @Size(min = 1, max = 10000, message = "Initial message must be between 1 and 10000 characters")
    private String initialMessage;
}