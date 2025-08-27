package com.myinterests.backend.controller;

import com.myinterests.backend.dto.message.CreatePublicThreadDto;
import com.myinterests.backend.dto.message.PublicMessageDto;
import com.myinterests.backend.dto.message.PublicMessageThreadDto;
import com.myinterests.backend.service.PublicMessageService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.Map;
import java.util.Set;

@RestController
@RequestMapping("/api/public-threads")
@RequiredArgsConstructor
@Slf4j
public class PublicMessageController {

    private final PublicMessageService publicMessageService;

    @PostMapping
    public ResponseEntity<PublicMessageThreadDto> createThread(
            @Valid @RequestBody CreatePublicThreadDto createDto,
            Authentication authentication) {
        
        String walletAddress = authentication.getName();
        PublicMessageThreadDto thread = publicMessageService.createThread(walletAddress, createDto);
        
        return ResponseEntity.status(HttpStatus.CREATED).body(thread);
    }

    @GetMapping
    public ResponseEntity<Page<PublicMessageThreadDto>> getThreads(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        
        Page<PublicMessageThreadDto> threads = publicMessageService.getThreads(page, size);
        return ResponseEntity.ok(threads);
    }

    @GetMapping("/featured")
    public ResponseEntity<Page<PublicMessageThreadDto>> getFeaturedThreads(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        
        Page<PublicMessageThreadDto> threads = publicMessageService.getFeaturedThreads(page, size);
        return ResponseEntity.ok(threads);
    }

    @GetMapping("/popular")
    public ResponseEntity<Page<PublicMessageThreadDto>> getPopularThreads(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        
        Page<PublicMessageThreadDto> threads = publicMessageService.getPopularThreads(page, size);
        return ResponseEntity.ok(threads);
    }

    @GetMapping("/search")
    public ResponseEntity<Page<PublicMessageThreadDto>> searchThreads(
            @RequestParam String q,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        
        Page<PublicMessageThreadDto> threads = publicMessageService.searchThreads(q, page, size);
        return ResponseEntity.ok(threads);
    }

    @GetMapping("/by-interests")
    public ResponseEntity<Page<PublicMessageThreadDto>> getThreadsByInterests(
            @RequestParam Set<String> interests,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        
        Page<PublicMessageThreadDto> threads = publicMessageService.getThreadsByInterests(interests, page, size);
        return ResponseEntity.ok(threads);
    }

    @GetMapping("/{threadId}")
    public ResponseEntity<PublicMessageThreadDto> getThread(@PathVariable Long threadId) {
        
        PublicMessageThreadDto thread = publicMessageService.getThread(threadId);
        return ResponseEntity.ok(thread);
    }

    @GetMapping("/{threadId}/messages")
    public ResponseEntity<Page<PublicMessageDto>> getThreadMessages(
            @PathVariable Long threadId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "50") int size) {
        
        Page<PublicMessageDto> messages = publicMessageService.getThreadMessages(threadId, page, size);
        return ResponseEntity.ok(messages);
    }

    @GetMapping("/messages/{messageId}/replies")
    public ResponseEntity<Page<PublicMessageDto>> getMessageReplies(
            @PathVariable Long messageId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        
        Page<PublicMessageDto> replies = publicMessageService.getMessageReplies(messageId, page, size);
        return ResponseEntity.ok(replies);
    }

    @PostMapping("/{threadId}/messages")
    public ResponseEntity<PublicMessageDto> sendMessage(
            @PathVariable Long threadId,
            @RequestBody Map<String, Object> messageData,
            Authentication authentication) {
        
        String walletAddress = authentication.getName();
        String content = (String) messageData.get("content");
        Long parentMessageId = messageData.get("parentMessageId") != null ? 
            Long.valueOf(messageData.get("parentMessageId").toString()) : null;
        String tags = (String) messageData.get("tags");
        
        PublicMessageDto message = publicMessageService.sendMessage(
            threadId, walletAddress, content, parentMessageId, tags);
        
        return ResponseEntity.status(HttpStatus.CREATED).body(message);
    }

    @PatchMapping("/{threadId}/deactivate")
    public ResponseEntity<Void> deactivateThread(
            @PathVariable Long threadId,
            Authentication authentication) {
        
        String walletAddress = authentication.getName();
        publicMessageService.deactivateThread(threadId, walletAddress);
        
        return ResponseEntity.ok().build();
    }

    @PatchMapping("/{threadId}/toggle-featured")
    public ResponseEntity<Void> toggleFeaturedStatus(
            @PathVariable Long threadId,
            Authentication authentication) {
        
        String walletAddress = authentication.getName();
        publicMessageService.toggleFeaturedStatus(threadId, walletAddress);
        
        return ResponseEntity.ok().build();
    }
}