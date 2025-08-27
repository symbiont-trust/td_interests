package com.myinterests.backend.dto.connection;

import com.myinterests.backend.domain.Connection;
import com.myinterests.backend.dto.user.UserProfileDto;
import lombok.Builder;
import lombok.Data;

import java.time.LocalDateTime;
import java.time.ZoneId;
import java.util.List;
import java.util.stream.Collectors;

@Data
@Builder
public class ConnectionRequestDto {
    private Long id;
    private String requesterWallet;
    private String recipientWallet;
    private String status;
    private List<UserProfileDto.InterestTagDto> commonInterests;
    private String createdAt;
    private boolean success;
    private String message;

    public static ConnectionRequestDto fromConnection(Connection connection) {
        return ConnectionRequestDto.builder()
            .id(connection.getId())
            .requesterWallet(connection.getRequesterWallet())
            .recipientWallet(connection.getRecipientWallet())
            .status(connection.getStatus().name())
            .commonInterests(connection.getCommonInterests() != null ?
                connection.getCommonInterests().stream()
                    .map(interest -> UserProfileDto.InterestTagDto.builder()
                        .id(interest.getId())
                        .name(interest.getName())
                        .build())
                    .collect(Collectors.toList()) : null)
            .createdAt(calendarToString(connection.getCreatedAt()))
            .success(true)
            .build();
    }

    private static String calendarToString(java.util.Calendar calendar) {
        if (calendar == null) return null;
        return LocalDateTime.ofInstant(calendar.toInstant(), ZoneId.systemDefault()).toString();
    }
}