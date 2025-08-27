package com.myinterests.backend.integration;

import com.myinterests.backend.domain.ApiClient;
import com.myinterests.backend.repository.ApiClientRepository;
import com.myinterests.backend.security.JwtUtil;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.jdbc.AutoConfigureTestDatabase;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.context.TestPropertySource;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;
import org.springframework.web.context.WebApplicationContext;
import org.springframework.transaction.annotation.Transactional;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.RANDOM_PORT)
@AutoConfigureTestDatabase(replace = AutoConfigureTestDatabase.Replace.NONE)
@TestPropertySource(locations = "classpath:application-test.properties")
@Transactional
class ProfileApiIntegrationTest {

    @Autowired
    private WebApplicationContext webApplicationContext;

    @Autowired
    private ApiClientRepository apiClientRepository;

    @Autowired
    private JwtUtil jwtUtil;

    private MockMvc mockMvc;
    private ApiClient testClient;

    @BeforeEach
    void setUp() {
        mockMvc = MockMvcBuilders.webAppContextSetup(webApplicationContext).build();
        
        // Create test API client
        testClient = ApiClient.builder()
                .clientId("test-integration-client")
                .clientName("Integration Test Client")
                .isActive(true)
                .build();
        apiClientRepository.save(testClient);
    }

    @Test
    void authenticateClient_WithValidClientId_ShouldReturnToken() throws Exception {
        // Given
        String requestBody = "{\"client_id\":\"" + testClient.getClientId() + "\"}";

        // When & Then
        mockMvc.perform(post("/api/profile-auth/authenticate")
                .contentType(MediaType.APPLICATION_JSON)
                .content(requestBody))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.access_token").exists())
                .andExpect(jsonPath("$.token_type").value("Bearer"))
                .andExpect(jsonPath("$.client_id").value(testClient.getClientId()));
    }

    @Test
    void authenticateClient_WithInvalidClientId_ShouldReturnUnauthorized() throws Exception {
        // Given
        String requestBody = "{\"client_id\":\"invalid-client-id\"}";

        // When & Then
        mockMvc.perform(post("/api/profile-auth/authenticate")
                .contentType(MediaType.APPLICATION_JSON)
                .content(requestBody))
                .andExpect(status().isUnauthorized())
                .andExpect(jsonPath("$.error").value("Authentication failed"));
    }

    @Test
    void authenticateClient_WithMissingClientId_ShouldReturnBadRequest() throws Exception {
        // Given
        String requestBody = "{}";

        // When & Then
        mockMvc.perform(post("/api/profile-auth/authenticate")
                .contentType(MediaType.APPLICATION_JSON)
                .content(requestBody))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.error").value("client_id is required"));
    }

    @Test
    void getProfile_WithValidToken_ShouldReturnUnauthorizedWithoutUser() throws Exception {
        // Given
        String token = jwtUtil.generateToken(testClient.getClientId(), "PROFILE_API_CLIENT");
        String nonExistentWallet = "0x1234567890abcdef1234567890abcdef12345678";

        // When & Then - Should return 404 as user doesn't exist
        mockMvc.perform(get("/api/profile/" + nonExistentWallet)
                .header("Authorization", "Bearer " + token))
                .andExpect(status().isNotFound())
                .andExpect(jsonPath("$.error").value("Profile not found"));
    }

    @Test
    void getProfile_WithoutToken_ShouldReturnUnauthorized() throws Exception {
        // Given
        String walletAddress = "0x1234567890abcdef1234567890abcdef12345678";

        // When & Then
        mockMvc.perform(get("/api/profile/" + walletAddress))
                .andExpect(status().isUnauthorized())
                .andExpect(jsonPath("$.error").value("Authentication required"));
    }

    @Test
    void getProfile_WithInvalidToken_ShouldReturnUnauthorized() throws Exception {
        // Given
        String walletAddress = "0x1234567890abcdef1234567890abcdef12345678";
        String invalidToken = "invalid.jwt.token";

        // When & Then
        mockMvc.perform(get("/api/profile/" + walletAddress)
                .header("Authorization", "Bearer " + invalidToken))
                .andExpect(status().isUnauthorized());
    }
}