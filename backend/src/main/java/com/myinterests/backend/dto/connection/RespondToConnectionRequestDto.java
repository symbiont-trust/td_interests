package com.myinterests.backend.dto.connection;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import lombok.Data;

@Data
public class RespondToConnectionRequestDto {
    @NotBlank(message = "Action is required")
    @Pattern(regexp = "ACCEPT|DISMISS", message = "Action must be ACCEPT or DISMISS")
    private String action;
}