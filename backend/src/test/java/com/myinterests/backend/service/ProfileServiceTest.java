package com.myinterests.backend.service;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.myinterests.backend.domain.Connection;
import com.myinterests.backend.domain.InterestTag;
import com.myinterests.backend.domain.User;
import com.myinterests.backend.domain.Country;
import com.myinterests.backend.repository.ConnectionRepository;
import com.myinterests.backend.repository.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.*;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class ProfileServiceTest {

    @Mock
    private UserRepository userRepository;

    @Mock
    private ConnectionRepository connectionRepository;

    @Mock
    private ObjectMapper objectMapper;

    @InjectMocks
    private ProfileService profileService;

    private User testUser;
    private Country testCountry;
    private Set<InterestTag> testInterests;

    @BeforeEach
    void setUp() {
        testCountry = Country.builder()
                .id(1L)
                .name("Kenya")
                .build();

        InterestTag interest1 = InterestTag.builder()
                .id(1L)
                .name("Technology")
                .build();

        InterestTag interest2 = InterestTag.builder()
                .id(2L)
                .name("Blockchain")
                .build();

        testInterests = Set.of(interest1, interest2);

        testUser = User.builder()
                .walletAddress("0x1234567890abcdef1234567890abcdef12345678")
                .handle("testuser")
                .country(testCountry)
                .interests(testInterests)
                .build();
    }

    @Test
    void generateProfileJson_WithValidUser_ShouldReturnProfileJson() throws Exception {
        // Given
        String walletAddress = testUser.getWalletAddress();
        List<Connection> connections = new ArrayList<>();
        
        when(userRepository.findByWalletAddress(walletAddress)).thenReturn(Optional.of(testUser));
        when(connectionRepository.findAcceptedConnectionsForUser(walletAddress)).thenReturn(connections);
        
        // Mock ObjectMapper methods
        when(objectMapper.createObjectNode()).thenReturn(new com.fasterxml.jackson.databind.ObjectMapper().createObjectNode());
        when(objectMapper.createArrayNode()).thenReturn(new com.fasterxml.jackson.databind.ObjectMapper().createArrayNode());
        when(objectMapper.writeValueAsString(org.mockito.ArgumentMatchers.any())).thenReturn("{\"test\":\"json\"}");

        // When
        String result = profileService.generateProfileJson(walletAddress);

        // Then
        assertThat(result).isNotNull();
        assertThat(result).isEqualTo("{\"test\":\"json\"}");
    }

    @Test
    void generateProfileJson_WithInvalidUser_ShouldThrowException() {
        // Given
        String walletAddress = "0xinvalid";
        when(userRepository.findByWalletAddress(walletAddress)).thenReturn(Optional.empty());

        // When/Then
        assertThatThrownBy(() -> profileService.generateProfileJson(walletAddress))
                .isInstanceOf(RuntimeException.class)
                .hasMessage("User not found");
    }

    @Test
    void generateProfileHash_WithValidJson_ShouldReturnHash() {
        // Given
        String profileJson = "{\"test\":\"data\"}";

        // When
        String result = profileService.generateProfileHash(profileJson);

        // Then
        assertThat(result).isNotNull();
        assertThat(result).hasSize(64); // SHA-256 produces 64 character hex string
        assertThat(result).matches("^[a-f0-9]{64}$"); // Should be hex string
    }

    @Test
    void generateProfileHash_WithEmptyJson_ShouldReturnHash() {
        // Given
        String profileJson = "";

        // When
        String result = profileService.generateProfileHash(profileJson);

        // Then
        assertThat(result).isNotNull();
        assertThat(result).hasSize(64);
    }
}