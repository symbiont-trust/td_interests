package com.myinterests.backend.dto.user;

import lombok.Builder;
import lombok.Data;

import java.util.List;

@Data
@Builder
public class SearchCriteria {
    private List<Long> interestIds;
    private List<String> locationTags;
    private Long countryId;
}