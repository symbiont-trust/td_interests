package com.myinterests.backend.dto.user;

import com.myinterests.backend.domain.User;
import com.myinterests.backend.domain.LocationTag;
import com.myinterests.backend.domain.InterestTag;
import lombok.Builder;
import lombok.Data;

import java.time.LocalDateTime;
import java.time.ZoneId;
import java.util.List;
import java.util.stream.Collectors;

@Data
@Builder
public class UserProfileDto {
    private String walletAddress;
    private String handle;
    private CountryDto country;
    private List<LocationTagDto> locationTags;
    private List<InterestTagDto> interests;
    private String createdAt;
    private String updatedAt;

    @Data
    @Builder
    public static class CountryDto {
        private Long id;
        private String name;
        private ContinentDto continent;
        
        @Data
        @Builder
        public static class ContinentDto {
            private Long id;
            private String name;
        }
    }

    @Data
    @Builder
    public static class LocationTagDto {
        private Long id;
        private String tagName;
    }

    @Data
    @Builder
    public static class InterestTagDto {
        private Long id;
        private String name;
    }

    public static UserProfileDto fromUser(User user) {
        return UserProfileDto.builder()
            .walletAddress(user.getWalletAddress())
            .handle(user.getHandle())
            .country(user.getCountry() != null ? CountryDto.builder()
                .id(user.getCountry().getId())
                .name(user.getCountry().getName())
                .continent(CountryDto.ContinentDto.builder()
                    .id(user.getCountry().getContinent().getId())
                    .name(user.getCountry().getContinent().getName())
                    .build())
                .build() : null)
            .locationTags(user.getLocationTags() != null ? 
                user.getLocationTags().stream()
                    .map(tag -> LocationTagDto.builder()
                        .id(tag.getId())
                        .tagName(tag.getTagName())
                        .build())
                    .collect(Collectors.toList()) : null)
            .interests(user.getInterests() != null ?
                user.getInterests().stream()
                    .map(interest -> InterestTagDto.builder()
                        .id(interest.getId())
                        .name(interest.getName())
                        .build())
                    .collect(Collectors.toList()) : null)
            .createdAt(calendarToString(user.getCreatedAt()))
            .updatedAt(calendarToString(user.getUpdatedAt()))
            .build();
    }

    public static UserProfileDto fromUserLimited(User user) {
        return UserProfileDto.builder()
            .walletAddress(user.getWalletAddress())
            .handle(user.getHandle())
            .country(user.getCountry() != null ? CountryDto.builder()
                .id(user.getCountry().getId())
                .name(user.getCountry().getName())
                .build() : null)
            .interests(user.getInterests() != null ?
                user.getInterests().stream()
                    .map(interest -> InterestTagDto.builder()
                        .id(interest.getId())
                        .name(interest.getName())
                        .build())
                    .collect(Collectors.toList()) : null)
            .createdAt(calendarToString(user.getCreatedAt()))
            .build();
    }

    private static String calendarToString(java.util.Calendar calendar) {
        if (calendar == null) return null;
        return LocalDateTime.ofInstant(calendar.toInstant(), ZoneId.systemDefault()).toString();
    }
}