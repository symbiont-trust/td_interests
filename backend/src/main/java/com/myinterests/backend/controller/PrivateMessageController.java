package com.myinterests.backend.controller;

import com.myinterests.backend.domain.Message;
import com.myinterests.backend.domain.PrivateMessageThread;
import com.myinterests.backend.dto.message.*;
import com.myinterests.backend.repository.MessageRepository;
import com.myinterests.backend.service.PrivateMessageService;
import com.myinterests.backend.service.UserService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/private-messages")
@RequiredArgsConstructor
@Slf4j
public class PrivateMessageController {

    private final PrivateMessageService privateMessageService;
    private final UserService userService;
    private final MessageRepository messageRepository;

    @PostMapping("/threads")
    public ResponseEntity<PrivateMessageThreadDto> createThread(
            @Valid @RequestBody CreateThreadDto request,
            Authentication authentication) {
        
        String senderWallet = authentication.getName();
        
        try {
            // Create or get existing thread
            PrivateMessageThread thread = privateMessageService.createOrGetThread(
                    senderWallet, request.getRecipientWallet(), request.getSubject());
            
            // Send initial message if provided
            privateMessageService.sendMessage(
                    thread.getId(), 
                    senderWallet, 
                    request.getInitialMessage(), 
                    null);
            
            // Convert to DTO
            PrivateMessageThreadDto threadDto = PrivateMessageThreadDto.fromThread(thread, senderWallet);
            
            // Add other user profile info
            try {
                String otherUserWallet = thread.getOtherUserWallet(senderWallet);
                threadDto.setOtherUserProfile(userService.getUserProfileDto(otherUserWallet));
            } catch (Exception e) {
                log.warn("Could not load other user profile: {}", e.getMessage());
            }
            
            return ResponseEntity.ok(threadDto);
        } catch (RuntimeException e) {
            log.error("Failed to create thread: {}", e.getMessage());
            return ResponseEntity.badRequest().build();
        }
    }

    @GetMapping("/threads")
    public ResponseEntity<Page<PrivateMessageThreadDto>> getUserThreads(
            @RequestParam(defaultValue = "false") boolean archived,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            Authentication authentication) {
        
        String userWallet = authentication.getName();
        
        Page<PrivateMessageThread> threads = privateMessageService.getUserThreads(
                userWallet, archived, page, size);
        
        Page<PrivateMessageThreadDto> threadDtos = threads.map(thread -> {
            PrivateMessageThreadDto dto = PrivateMessageThreadDto.fromThread(thread, userWallet);
            
            // Add other user profile info
            try {
                String otherUserWallet = thread.getOtherUserWallet(userWallet);
                dto.setOtherUserProfile(userService.getUserProfileDto(otherUserWallet));
            } catch (Exception e) {
                log.warn("Could not load other user profile: {}", e.getMessage());
            }
            
            return dto;
        });
        
        return ResponseEntity.ok(threadDtos);
    }

    @GetMapping("/threads/{threadId}")
    public ResponseEntity<PrivateMessageThreadDto> getThread(
            @PathVariable Long threadId,
            Authentication authentication) {
        
        String userWallet = authentication.getName();
        
        try {
            PrivateMessageThread thread = privateMessageService.getThreadById(threadId, userWallet);
            PrivateMessageThreadDto dto = PrivateMessageThreadDto.fromThread(thread, userWallet);
            
            // Add other user profile info
            try {
                String otherUserWallet = thread.getOtherUserWallet(userWallet);
                dto.setOtherUserProfile(userService.getUserProfileDto(otherUserWallet));
            } catch (Exception e) {
                log.warn("Could not load other user profile: {}", e.getMessage());
            }
            
            return ResponseEntity.ok(dto);
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }

    @GetMapping("/threads/{threadId}/messages")
    public ResponseEntity<Page<MessageDto>> getThreadMessages(
            @PathVariable Long threadId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size,
            Authentication authentication) {
        
        String userWallet = authentication.getName();
        
        try {
            Page<Message> messages = privateMessageService.getThreadMessages(threadId, userWallet, page, size);
            
            Page<MessageDto> messageDtos = messages.map(message -> {
                MessageDto dto = MessageDto.fromMessage(message);
                
                // Add reply count
                dto.setReplyCount(messageRepository.countByParentMessageId(message.getId()));
                
                // Add sender profile info
                try {
                    dto.setSenderProfile(userService.getUserProfileDto(message.getSenderWallet()));
                } catch (Exception e) {
                    log.warn("Could not load sender profile: {}", e.getMessage());
                }
                
                return dto;
            });
            
            return ResponseEntity.ok(messageDtos);
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }

    @PostMapping("/messages")
    public ResponseEntity<MessageDto> sendMessage(
            @Valid @RequestBody CreateMessageDto request,
            Authentication authentication) {
        
        String senderWallet = authentication.getName();
        
        try {
            Message message = privateMessageService.sendMessage(
                    request.getThreadId(),
                    senderWallet,
                    request.getContent(),
                    request.getParentMessageId());
            
            MessageDto messageDto = MessageDto.fromMessage(message);
            messageDto.setReplyCount(0); // New message has no replies
            
            // Add sender profile info
            try {
                messageDto.setSenderProfile(userService.getUserProfileDto(senderWallet));
            } catch (Exception e) {
                log.warn("Could not load sender profile: {}", e.getMessage());
            }
            
            return ResponseEntity.ok(messageDto);
        } catch (RuntimeException e) {
            log.error("Failed to send message: {}", e.getMessage());
            return ResponseEntity.badRequest().build();
        }
    }

    @GetMapping("/messages/{messageId}/replies")
    public ResponseEntity<Page<MessageDto>> getMessageReplies(
            @PathVariable Long messageId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        
        Page<Message> replies = privateMessageService.getMessageReplies(messageId, page, size);
        
        Page<MessageDto> replyDtos = replies.map(reply -> {
            MessageDto dto = MessageDto.fromMessage(reply);
            
            // Add reply count for nested replies
            dto.setReplyCount(messageRepository.countByParentMessageId(reply.getId()));
            
            // Add sender profile info
            try {
                dto.setSenderProfile(userService.getUserProfileDto(reply.getSenderWallet()));
            } catch (Exception e) {
                log.warn("Could not load sender profile: {}", e.getMessage());
            }
            
            return dto;
        });
        
        return ResponseEntity.ok(replyDtos);
    }

    @PutMapping("/threads/{threadId}/read")
    public ResponseEntity<Void> markThreadAsRead(
            @PathVariable Long threadId,
            Authentication authentication) {
        
        String userWallet = authentication.getName();
        
        try {
            privateMessageService.markThreadAsRead(threadId, userWallet);
            return ResponseEntity.ok().build();
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }

    @PutMapping("/threads/{threadId}/archive")
    public ResponseEntity<Void> archiveThread(
            @PathVariable Long threadId,
            @RequestParam boolean archived,
            Authentication authentication) {
        
        String userWallet = authentication.getName();
        
        try {
            privateMessageService.archiveThread(threadId, userWallet, archived);
            return ResponseEntity.ok().build();
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }

    @GetMapping("/unread-count")
    public ResponseEntity<Long> getUnreadCount(Authentication authentication) {
        String userWallet = authentication.getName();
        Long count = privateMessageService.getUnreadCount(userWallet);
        return ResponseEntity.ok(count);
    }

    @GetMapping("/unread-threads")
    public ResponseEntity<Long> getUnreadThreadCount(Authentication authentication) {
        String userWallet = authentication.getName();
        Long count = privateMessageService.getUnreadThreadCount(userWallet);
        return ResponseEntity.ok(count);
    }
}