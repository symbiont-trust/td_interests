package com.myinterests.backend.controller;

import com.myinterests.backend.domain.Connection;
import com.myinterests.backend.service.ConnectionService;
import com.myinterests.backend.dto.connection.*;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import jakarta.validation.Valid;
import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/connections")
@RequiredArgsConstructor
@Slf4j
public class ConnectionController {

    private final ConnectionService connectionService;

    @PostMapping("/request")
    public ResponseEntity<ConnectionRequestDto> sendConnectionRequest(
            @Valid @RequestBody SendConnectionRequestDto request,
            Authentication authentication) {
        
        String requesterWallet = authentication.getName();
        
        try {
            Connection connection = connectionService.sendConnectionRequest(
                requesterWallet, 
                request.getRecipientWallet()
            );
            
            return ResponseEntity.ok(ConnectionRequestDto.fromConnection(connection));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest()
                .body(ConnectionRequestDto.builder()
                    .success(false)
                    .message(e.getMessage())
                    .build());
        }
    }

    @GetMapping("/requests/{type}")
    public ResponseEntity<List<ConnectionRequestDto>> getConnectionRequests(
            @PathVariable String type,
            Authentication authentication) {
        
        String walletAddress = authentication.getName();
        
        try {
            List<Connection> requests = connectionService.getConnectionRequests(walletAddress, type);
            List<ConnectionRequestDto> requestDtos = requests.stream()
                .map(ConnectionRequestDto::fromConnection)
                .collect(Collectors.toList());
            
            return ResponseEntity.ok(requestDtos);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().build();
        }
    }

    @PutMapping("/requests/{requestId}")
    public ResponseEntity<ConnectionRequestDto> respondToConnectionRequest(
            @PathVariable Long requestId,
            @Valid @RequestBody RespondToConnectionRequestDto request,
            Authentication authentication) {
        
        String recipientWallet = authentication.getName();
        
        try {
            Connection.ConnectionStatus status = "ACCEPT".equals(request.getAction()) ? 
                Connection.ConnectionStatus.ACCEPTED : Connection.ConnectionStatus.DISMISSED;
                
            Connection connection = connectionService.respondToConnectionRequest(
                requestId, 
                recipientWallet, 
                status
            );
            
            return ResponseEntity.ok(ConnectionRequestDto.fromConnection(connection));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest()
                .body(ConnectionRequestDto.builder()
                    .success(false)
                    .message(e.getMessage())
                    .build());
        }
    }

    @GetMapping
    public ResponseEntity<List<ConnectionRequestDto>> getConnections(Authentication authentication) {
        String walletAddress = authentication.getName();
        
        List<Connection> connections = connectionService.getConnections(walletAddress);
        List<ConnectionRequestDto> connectionDtos = connections.stream()
            .map(ConnectionRequestDto::fromConnection)
            .collect(Collectors.toList());
        
        return ResponseEntity.ok(connectionDtos);
    }

    @DeleteMapping("/{connectionId}")
    public ResponseEntity<Void> removeConnection(
            @PathVariable Long connectionId,
            Authentication authentication) {
        
        String walletAddress = authentication.getName();
        
        try {
            connectionService.removeConnection(connectionId, walletAddress);
            return ResponseEntity.ok().build();
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().build();
        }
    }
}