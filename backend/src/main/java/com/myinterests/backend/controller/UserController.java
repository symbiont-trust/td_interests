package com.myinterests.backend.controller;

import com.myinterests.backend.domain.User;
import com.myinterests.backend.domain.InterestTag;
import com.myinterests.backend.service.UserService;
import com.myinterests.backend.service.ConnectionService;
import com.myinterests.backend.dto.user.*;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import jakarta.validation.Valid;
import java.util.List;
import java.util.Set;

@RestController
@RequestMapping("/api/users")
@RequiredArgsConstructor
@Slf4j
public class UserController {

    private final UserService userService;
    private final ConnectionService connectionService;

    @GetMapping("/profile")
    public ResponseEntity<UserProfileDto> getCurrentUserProfile(Authentication authentication) {
        String walletAddress = authentication.getName();
        User user = userService.getUserByWalletAddress(walletAddress);
        
        if (user == null) {
            return ResponseEntity.notFound().build();
        }
        
        return ResponseEntity.ok(UserProfileDto.fromUser(user));
    }

    @GetMapping("/{walletAddress}")
    public ResponseEntity<UserProfileDto> getUserProfile(
            @PathVariable String walletAddress,
            Authentication authentication) {
        
        String currentWallet = authentication.getName();
        User user = userService.getUserByWalletAddress(walletAddress);
        
        if (user == null) {
            return ResponseEntity.notFound().build();
        }
        
        // Check if users are connected or if it's the same user
        boolean canViewProfile = currentWallet.equals(walletAddress) || 
                               connectionService.areUsersConnected(currentWallet, walletAddress);
        
        if (!canViewProfile) {
            // Return limited profile info for non-connected users
            return ResponseEntity.ok(UserProfileDto.fromUserLimited(user));
        }
        
        return ResponseEntity.ok(UserProfileDto.fromUser(user));
    }

    @PutMapping("/profile")
    public ResponseEntity<UserProfileDto> updateProfile(
            @Valid @RequestBody UpdateProfileRequest request,
            Authentication authentication) {
        
        String walletAddress = authentication.getName();
        User updatedUser = userService.updateUserProfile(walletAddress, request);
        
        return ResponseEntity.ok(UserProfileDto.fromUser(updatedUser));
    }

    @GetMapping("/search")
    public ResponseEntity<SearchResultDto> searchUsers(
            @RequestParam(required = false) List<Long> interests,
            @RequestParam(required = false) List<String> locationTags,
            @RequestParam(required = false) Long country,
            @PageableDefault(size = 10) Pageable pageable,
            Authentication authentication) {
        
        String currentWallet = authentication.getName();
        
        SearchCriteria criteria = SearchCriteria.builder()
            .interestIds(interests)
            .locationTags(locationTags)
            .countryId(country)
            .build();
            
        Page<User> searchResults = userService.searchUsers(criteria, currentWallet, pageable);
        
        return ResponseEntity.ok(SearchResultDto.fromPage(searchResults));
    }

    @GetMapping("/{walletAddress}/mutual-connections")
    public ResponseEntity<List<MutualConnectionDto>> getMutualConnections(
            @PathVariable String walletAddress,
            Authentication authentication) {
        
        String currentWallet = authentication.getName();
        List<MutualConnectionDto> mutualConnections = 
            connectionService.getMutualConnections(currentWallet, walletAddress);
        
        return ResponseEntity.ok(mutualConnections);
    }
}