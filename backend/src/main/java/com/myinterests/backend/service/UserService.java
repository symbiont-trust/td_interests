package com.myinterests.backend.service;

import com.myinterests.backend.domain.User;
import com.myinterests.backend.domain.Country;
import com.myinterests.backend.domain.InterestTag;
import com.myinterests.backend.domain.LocationTag;
import com.myinterests.backend.dto.auth.RegisterRequest;
import com.myinterests.backend.dto.user.UserProfileDto;
import com.myinterests.backend.dto.user.UpdateProfileRequest;
import com.myinterests.backend.dto.user.SearchCriteria;
import com.myinterests.backend.dto.user.UserCreationResult;
import com.myinterests.backend.repository.UserRepository;
import com.myinterests.backend.repository.CountryRepository;
import com.myinterests.backend.repository.InterestTagRepository;
import com.myinterests.backend.repository.LocationTagRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.HashSet;
import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class UserService {

    private final UserRepository userRepository;
    private final CountryRepository countryRepository;
    private final InterestTagRepository interestTagRepository;
    private final LocationTagRepository locationTagRepository;

    @Transactional
    public UserCreationResult createUser(RegisterRequest request) {
        // Check if user already exists
        var existingUser = userRepository.findByWalletAddress(request.getWalletAddress());
        if (existingUser.isPresent()) {
            return UserCreationResult.userAlreadyExists(existingUser.get());
        }

        // Get country if provided
        Country country = null;
        if (request.getCountryId() != null) {
            var countryOpt = countryRepository.findById(request.getCountryId());
            if (countryOpt.isEmpty()) {
                return UserCreationResult.invalidData("Country not found");
            }
            country = countryOpt.get();
        }

        // Get interests
        Set<InterestTag> interests = interestTagRepository.findByIdIn(request.getInterestIds());
        if (interests.isEmpty()) {
            return UserCreationResult.invalidData("At least one valid interest must be selected");
        }

        // Create user
        User user = User.builder()
            .walletAddress(request.getWalletAddress())
            .handle(request.getHandle())
            .country(country)
            .interests(interests)
            .locationTags(new HashSet<>())
            .build();

        // Save user first
        User savedUser = userRepository.save(user);

        // Create location tags if provided
        if (request.getLocationTags() != null && !request.getLocationTags().isEmpty()) {
            Set<LocationTag> locationTags = request.getLocationTags().stream()
                .map(tagName -> LocationTag.builder()
                    .tagName(tagName)
                    .user(savedUser)
                    .build())
                .collect(Collectors.toSet());
            
            locationTagRepository.saveAll(locationTags);
            savedUser.setLocationTags(locationTags);
        }

        log.info("Created user with wallet address: {}", savedUser.getWalletAddress());
        return UserCreationResult.success(savedUser);
    }

    public User getUserByWalletAddress(String walletAddress) {
        return userRepository.findByWalletAddress(walletAddress).orElse(null);
    }

    @Transactional
    public User updateUser(String walletAddress, RegisterRequest updateRequest) {
        User user = userRepository.findByWalletAddress(walletAddress)
            .orElseThrow(() -> new RuntimeException("User not found"));

        // Update basic fields
        user.setHandle(updateRequest.getHandle());

        // Update country
        if (updateRequest.getCountryId() != null) {
            Country country = countryRepository.findById(updateRequest.getCountryId())
                .orElseThrow(() -> new RuntimeException("Country not found"));
            user.setCountry(country);
        } else {
            user.setCountry(null);
        }

        // Update interests
        Set<InterestTag> interests = interestTagRepository.findByIdIn(updateRequest.getInterestIds());
        if (interests.isEmpty()) {
            throw new RuntimeException("At least one valid interest must be selected");
        }
        user.setInterests(interests);

        // Update location tags - remove old ones and create new ones
        locationTagRepository.deleteByUserWalletAddress(walletAddress);
        if (updateRequest.getLocationTags() != null && !updateRequest.getLocationTags().isEmpty()) {
            Set<LocationTag> locationTags = updateRequest.getLocationTags().stream()
                .map(tagName -> LocationTag.builder()
                    .tagName(tagName)
                    .user(user)
                    .build())
                .collect(Collectors.toSet());
            
            locationTagRepository.saveAll(locationTags);
            user.setLocationTags(locationTags);
        } else {
            user.setLocationTags(new HashSet<>());
        }

        return userRepository.save(user);
    }

    @Transactional
    public User updateUserProfile(String walletAddress, UpdateProfileRequest request) {
        User user = userRepository.findByWalletAddress(walletAddress)
            .orElseThrow(() -> new RuntimeException("User not found"));

        // Update basic fields
        user.setHandle(request.getHandle());

        // Update country
        if (request.getCountryId() != null) {
            Country country = countryRepository.findById(request.getCountryId())
                .orElseThrow(() -> new RuntimeException("Country not found"));
            user.setCountry(country);
        } else {
            user.setCountry(null);
        }

        // Update interests
        if (request.getInterestIds() != null && !request.getInterestIds().isEmpty()) {
            Set<InterestTag> interests = interestTagRepository.findByIdIn(request.getInterestIds());
            if (interests.isEmpty()) {
                throw new RuntimeException("At least one valid interest must be selected");
            }
            user.setInterests(interests);
        }

        // Update location tags - remove old ones and create new ones
        locationTagRepository.deleteByUserWalletAddress(walletAddress);
        if (request.getLocationTags() != null && !request.getLocationTags().isEmpty()) {
            // Remove duplicates from input while preserving order, then create entities
            List<String> uniqueTagNames = request.getLocationTags().stream()
                .distinct()
                .collect(Collectors.toList());
            
            List<LocationTag> locationTagsList = uniqueTagNames.stream()
                .map(tagName -> LocationTag.builder()
                    .tagName(tagName)
                    .user(user)
                    .build())
                .collect(Collectors.toList());
            
            locationTagRepository.saveAll(locationTagsList);
            
            // Convert to Set for the entity relationship
            Set<LocationTag> locationTags = new HashSet<>(locationTagsList);
            user.setLocationTags(locationTags);
        } else {
            user.setLocationTags(new HashSet<>());
        }

        User savedUser = userRepository.save(user);
        return savedUser;
    }

    public Page<User> searchUsers(
            SearchCriteria criteria, 
            String excludeWallet, 
            Pageable pageable) {

        Set<InterestTag> interests = null;
        if (criteria.getInterestIds() != null && !criteria.getInterestIds().isEmpty()) {
            interests = interestTagRepository.findByIdIn(new HashSet<>(criteria.getInterestIds()));
        }

        String locationTag = null;
        if (criteria.getLocationTags() != null && !criteria.getLocationTags().isEmpty()) {
            locationTag = criteria.getLocationTags().get(0); // Use first location tag for search
        }

        return userRepository.findBySearchCriteria(
            interests, 
            locationTag, 
            criteria.getCountryId(), 
            excludeWallet, 
            pageable
        );
    }
    
    public UserProfileDto getUserProfileDto(String walletAddress) {
        User user = userRepository.findByWalletAddress(walletAddress)
            .orElseThrow(() -> new RuntimeException("User not found"));
        return UserProfileDto.fromUser(user);
    }
}