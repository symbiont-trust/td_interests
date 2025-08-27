package com.myinterests.backend.service;

import com.myinterests.backend.domain.Connection;
import com.myinterests.backend.domain.User;
import com.myinterests.backend.domain.InterestTag;
import com.myinterests.backend.dto.user.MutualConnectionDto;
import com.myinterests.backend.dto.user.UserProfileDto;
import com.myinterests.backend.repository.ConnectionRepository;
import com.myinterests.backend.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class ConnectionService {

    private final ConnectionRepository connectionRepository;
    private final UserRepository userRepository;

    @Transactional
    public Connection sendConnectionRequest(String requesterWallet, String recipientWallet) {
        // Check if users exist
        User requester = userRepository.findByWalletAddress(requesterWallet)
            .orElseThrow(() -> new RuntimeException("Requester not found"));
        User recipient = userRepository.findByWalletAddress(recipientWallet)
            .orElseThrow(() -> new RuntimeException("Recipient not found"));

        // Check if connection already exists
        Optional<Connection> existingConnection = connectionRepository
            .findByWallets(requesterWallet, recipientWallet);
        
        if (existingConnection.isPresent()) {
            throw new RuntimeException("Connection request already exists");
        }

        // Calculate common interests
        Set<InterestTag> commonInterests = findCommonInterests(requester.getInterests(), recipient.getInterests());
        
        if (commonInterests.isEmpty()) {
            throw new RuntimeException("No common interests found");
        }

        Connection connection = Connection.builder()
            .requesterWallet(requesterWallet)
            .recipientWallet(recipientWallet)
            .status(Connection.ConnectionStatus.PENDING)
            .commonInterests(commonInterests)
            .build();

        return connectionRepository.save(connection);
    }

    @Transactional
    public Connection respondToConnectionRequest(Long connectionId, String recipientWallet, Connection.ConnectionStatus response) {
        Connection connection = connectionRepository.findById(connectionId)
            .orElseThrow(() -> new RuntimeException("Connection request not found"));

        if (!connection.getRecipientWallet().equals(recipientWallet)) {
            throw new RuntimeException("Not authorized to respond to this request");
        }

        if (connection.getStatus() != Connection.ConnectionStatus.PENDING) {
            throw new RuntimeException("Connection request already processed");
        }

        connection.setStatus(response);
        return connectionRepository.save(connection);
    }

    public List<Connection> getConnectionRequests(String walletAddress, String type) {
        switch (type.toLowerCase()) {
            case "sent":
                return connectionRepository.findByRequesterWalletAndStatus(walletAddress, Connection.ConnectionStatus.PENDING);
            case "received":
                return connectionRepository.findByRecipientWalletAndStatus(walletAddress, Connection.ConnectionStatus.PENDING);
            default:
                throw new IllegalArgumentException("Invalid request type: " + type);
        }
    }

    public List<Connection> getConnections(String walletAddress) {
        return connectionRepository.findByWalletAndStatus(walletAddress, Connection.ConnectionStatus.ACCEPTED);
    }

    public boolean areUsersConnected(String wallet1, String wallet2) {
        Optional<Connection> connection = connectionRepository.findByWallets(wallet1, wallet2);
        return connection.isPresent() && connection.get().getStatus() == Connection.ConnectionStatus.ACCEPTED;
    }

    public List<MutualConnectionDto> getMutualConnections(String requesterWallet, String targetWallet) {
        // Get connections of the requester
        List<Connection> requesterConnections = getConnections(requesterWallet);
        Set<String> requesterConnectionWallets = requesterConnections.stream()
            .map(conn -> conn.getRequesterWallet().equals(requesterWallet) ? 
                conn.getRecipientWallet() : conn.getRequesterWallet())
            .collect(Collectors.toSet());

        // Get connections of the target user
        List<Connection> targetConnections = getConnections(targetWallet);
        Set<String> targetConnectionWallets = targetConnections.stream()
            .map(conn -> conn.getRequesterWallet().equals(targetWallet) ? 
                conn.getRecipientWallet() : conn.getRequesterWallet())
            .collect(Collectors.toSet());

        // Find mutual connections
        Set<String> mutualWallets = new HashSet<>(requesterConnectionWallets);
        mutualWallets.retainAll(targetConnectionWallets);

        return mutualWallets.stream()
            .map(walletAddress -> {
                User user = userRepository.findByWalletAddress(walletAddress).orElse(null);
                if (user == null) return null;

                // Find common interests between requester and mutual connection
                User requesterUser = userRepository.findByWalletAddress(requesterWallet).orElse(null);
                Set<InterestTag> commonInterests = requesterUser != null ? 
                    findCommonInterests(requesterUser.getInterests(), user.getInterests()) : 
                    new HashSet<>();

                return MutualConnectionDto.builder()
                    .walletAddress(user.getWalletAddress())
                    .handle(user.getHandle())
                    .commonInterests(commonInterests.stream()
                        .map(interest -> UserProfileDto.InterestTagDto.builder()
                            .id(interest.getId())
                            .name(interest.getName())
                            .build())
                        .collect(Collectors.toList()))
                    .build();
            })
            .filter(Objects::nonNull)
            .collect(Collectors.toList());
    }

    @Transactional
    public void removeConnection(Long connectionId, String walletAddress) {
        Connection connection = connectionRepository.findById(connectionId)
            .orElseThrow(() -> new RuntimeException("Connection not found"));

        // Verify that the user is part of this connection
        if (!connection.getRequesterWallet().equals(walletAddress) && 
            !connection.getRecipientWallet().equals(walletAddress)) {
            throw new RuntimeException("Not authorized to remove this connection");
        }

        connectionRepository.delete(connection);
    }

    private Set<InterestTag> findCommonInterests(Set<InterestTag> interests1, Set<InterestTag> interests2) {
        if (interests1 == null || interests2 == null) {
            return new HashSet<>();
        }
        
        Set<InterestTag> common = new HashSet<>(interests1);
        common.retainAll(interests2);
        return common;
    }
}