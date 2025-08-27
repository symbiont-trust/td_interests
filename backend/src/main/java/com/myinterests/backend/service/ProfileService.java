package com.myinterests.backend.service;

import com.myinterests.backend.domain.Connection;
import com.myinterests.backend.domain.InterestTag;
import com.myinterests.backend.domain.User;
import com.myinterests.backend.repository.ConnectionRepository;
import com.myinterests.backend.repository.UserRepository;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.node.ObjectNode;
import com.fasterxml.jackson.databind.node.ArrayNode;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.util.List;
import java.util.stream.Collectors;
import java.nio.charset.StandardCharsets;

@Service
@RequiredArgsConstructor
@Slf4j
public class ProfileService {
    
    private final UserRepository userRepository;
    private final ConnectionRepository connectionRepository;
    private final ObjectMapper objectMapper;
    
    public String generateProfileJson(String walletAddress) {
        User user = userRepository.findByWalletAddress(walletAddress)
                .orElseThrow(() -> new RuntimeException("User not found"));
        
        // Get user's connections
        List<Connection> acceptedConnections = connectionRepository.findAcceptedConnectionsForUser(walletAddress);
        
        // Build profile JSON
        ObjectNode profileJson = objectMapper.createObjectNode();
        profileJson.put("profile-wallet-address", user.getWalletAddress());
        profileJson.put("non-unique-handle", user.getHandle());
        
        // Add profile interests
        ArrayNode interestsArray = objectMapper.createArrayNode();
        user.getInterests().stream()
                .map(InterestTag::getName)
                .forEach(interestsArray::add);
        profileJson.set("profile-interests", interestsArray);
        
        // Add contacts
        ArrayNode contactsArray = objectMapper.createArrayNode();
        for (Connection connection : acceptedConnections) {
            String contactWallet = connection.getOtherUserWallet(walletAddress);
            User contact = userRepository.findByWalletAddress(contactWallet)
                    .orElse(null);
            
            if (contact != null) {
                ObjectNode contactJson = objectMapper.createObjectNode();
                contactJson.put("wallet-address", contact.getWalletAddress());
                contactJson.put("non-unique-handle", contact.getHandle());
                
                // Add common interests
                ArrayNode commonInterestsArray = objectMapper.createArrayNode();
                List<String> commonInterests = getCommonInterests(user, contact);
                commonInterests.forEach(commonInterestsArray::add);
                contactJson.set("common-interests", commonInterestsArray);
                
                contactsArray.add(contactJson);
            }
        }
        profileJson.set("contacts", contactsArray);
        
        try {
            // Convert to compact JSON (no spaces)
            return objectMapper.writeValueAsString(profileJson);
        } catch (Exception e) {
            throw new RuntimeException("Failed to generate profile JSON", e);
        }
    }
    
    public String generateProfileHash(String profileJson) {
        try {
            MessageDigest digest = MessageDigest.getInstance("SHA-256");
            byte[] hash = digest.digest(profileJson.getBytes(StandardCharsets.UTF_8));
            
            // Convert to hex string
            StringBuilder hexString = new StringBuilder();
            for (byte b : hash) {
                String hex = Integer.toHexString(0xff & b);
                if (hex.length() == 1) {
                    hexString.append('0');
                }
                hexString.append(hex);
            }
            return hexString.toString();
        } catch (NoSuchAlgorithmException e) {
            throw new RuntimeException("SHA-256 algorithm not available", e);
        }
    }
    
    private List<String> getCommonInterests(User user1, User user2) {
        return user1.getInterests().stream()
                .filter(interest -> user2.getInterests().contains(interest))
                .map(InterestTag::getName)
                .collect(Collectors.toList());
    }
}