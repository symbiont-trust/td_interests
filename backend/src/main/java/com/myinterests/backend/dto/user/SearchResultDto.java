package com.myinterests.backend.dto.user;

import com.myinterests.backend.domain.User;
import lombok.Builder;
import lombok.Data;
import org.springframework.data.domain.Page;

import java.util.List;
import java.util.stream.Collectors;

@Data
@Builder
public class SearchResultDto {
    private List<UserProfileDto> users;
    private long totalElements;
    private int totalPages;
    private int currentPage;
    private boolean hasNext;
    private boolean hasPrevious;

    public static SearchResultDto fromPage(Page<User> page) {
        return SearchResultDto.builder()
            .users(page.getContent().stream()
                .map(UserProfileDto::fromUserLimited)
                .collect(Collectors.toList()))
            .totalElements(page.getTotalElements())
            .totalPages(page.getTotalPages())
            .currentPage(page.getNumber())
            .hasNext(page.hasNext())
            .hasPrevious(page.hasPrevious())
            .build();
    }
}