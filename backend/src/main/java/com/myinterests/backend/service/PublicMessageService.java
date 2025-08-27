package com.myinterests.backend.service;

import com.myinterests.backend.domain.InterestTag;
import com.myinterests.backend.domain.Message;
import com.myinterests.backend.domain.PublicMessageThread;
import com.myinterests.backend.domain.User;
import com.myinterests.backend.dto.message.CreatePublicThreadDto;
import com.myinterests.backend.dto.message.MessageDto;
import com.myinterests.backend.dto.message.PublicMessageDto;
import com.myinterests.backend.dto.message.PublicMessageThreadDto;
import com.myinterests.backend.dto.user.UserProfileDto;
import com.myinterests.backend.repository.InterestTagRepository;
import com.myinterests.backend.repository.MessageRepository;
import com.myinterests.backend.repository.PublicMessageThreadRepository;
import com.myinterests.backend.repository.UserRepository;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.time.ZoneId;
import java.util.Calendar;
import java.util.List;
import java.util.Optional;
import java.util.Set;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class PublicMessageService {
    
    private final PublicMessageThreadRepository publicMessageThreadRepository;
    private final MessageRepository messageRepository;
    private final InterestTagRepository interestTagRepository;
    private final UserRepository userRepository;
    private final UserService userService;
    private final NotificationService notificationService;

    @Transactional
    public PublicMessageThreadDto createThread(String creatorWallet, CreatePublicThreadDto createDto) {
        // Validate user exists
        if (!userRepository.existsByWalletAddress(creatorWallet)) {
            throw new EntityNotFoundException("User not found");
        }

        // Find or create interest tags
        Set<InterestTag> interests = createDto.getInterestTags().stream()
                .map(tagName -> interestTagRepository.findByNameIgnoreCase(tagName)
                        .orElseGet(() -> interestTagRepository.save(
                                InterestTag.builder()
                                        .name(tagName)
                                        .build())))
                .collect(Collectors.toSet());

        // Create thread
        PublicMessageThread thread = PublicMessageThread.builder()
                .creatorWallet(creatorWallet)
                .title(createDto.getTitle())
                .description(createDto.getDescription())
                .interests(interests)
                .messageCount(1L)
                .lastMessageAt(LocalDateTime.now())
                .isActive(true)
                .isFeatured(false)
                .build();

        thread = publicMessageThreadRepository.save(thread);

        // Create initial message
        Message initialMessage = Message.builder()
                .threadId(thread.getId())
                .threadType(Message.ThreadType.PUBLIC)
                .senderWallet(creatorWallet)
                .content(createDto.getInitialMessage())
                .build();

        messageRepository.save(initialMessage);

        return convertToDto(thread);
    }

    @Transactional(readOnly = true)
    public Page<PublicMessageThreadDto> getThreads(int page, int size) {
        Pageable pageable = PageRequest.of(page, size);
        return publicMessageThreadRepository.findByIsActiveTrueOrderByLastMessageAtDescUpdatedAtDesc(pageable)
                .map(this::convertToDto);
    }

    @Transactional(readOnly = true)
    public Page<PublicMessageThreadDto> getFeaturedThreads(int page, int size) {
        Pageable pageable = PageRequest.of(page, size);
        return publicMessageThreadRepository.findByIsFeaturedTrueAndIsActiveTrueOrderByUpdatedAtDesc(pageable)
                .map(this::convertToDto);
    }

    @Transactional(readOnly = true)
    public Page<PublicMessageThreadDto> getPopularThreads(int page, int size) {
        Pageable pageable = PageRequest.of(page, size);
        return publicMessageThreadRepository.findPopularThreads(pageable)
                .map(this::convertToDto);
    }

    @Transactional(readOnly = true)
    public Page<PublicMessageThreadDto> searchThreads(String query, int page, int size) {
        Pageable pageable = PageRequest.of(page, size);
        return publicMessageThreadRepository.findByTitleContainingIgnoreCaseAndIsActiveTrue(query, pageable)
                .map(this::convertToDto);
    }

    @Transactional(readOnly = true)
    public Page<PublicMessageThreadDto> getThreadsByInterests(Set<String> interestTags, int page, int size) {
        Set<InterestTag> interests = interestTags.stream()
                .map(tagName -> interestTagRepository.findByNameIgnoreCase(tagName))
                .filter(Optional::isPresent)
                .map(Optional::get)
                .collect(Collectors.toSet());

        if (interests.isEmpty()) {
            return Page.empty();
        }

        Pageable pageable = PageRequest.of(page, size);
        return publicMessageThreadRepository.findByInterestsInAndIsActiveTrue(interests, pageable)
                .map(this::convertToDto);
    }

    @Transactional(readOnly = true)
    public PublicMessageThreadDto getThread(Long threadId) {
        PublicMessageThread thread = publicMessageThreadRepository.findByIdWithDetails(threadId)
                .orElseThrow(() -> new EntityNotFoundException("Thread not found"));
        return convertToDto(thread);
    }

    @Transactional(readOnly = true)
    public Page<PublicMessageDto> getThreadMessages(Long threadId, int page, int size) {
        // Verify thread exists and is active
        if (!publicMessageThreadRepository.findByIdWithDetails(threadId).isPresent()) {
            throw new EntityNotFoundException("Thread not found");
        }

        Pageable pageable = PageRequest.of(page, size);
        return messageRepository.findByThreadIdAndThreadTypeAndParentMessageIdIsNullOrderByCreatedAtDesc(
                threadId, Message.ThreadType.PUBLIC, pageable)
                .map(this::convertToPublicMessageDto);
    }

    @Transactional(readOnly = true)
    public Page<PublicMessageDto> getMessageReplies(Long parentMessageId, int page, int size) {
        Pageable pageable = PageRequest.of(page, size);
        return messageRepository.findByParentMessageIdOrderByCreatedAtDesc(parentMessageId, pageable)
                .map(this::convertToPublicMessageDto);
    }

    @Transactional
    public PublicMessageDto sendMessage(Long threadId, String senderWallet, String content, Long parentMessageId, String tags) {
        // Verify thread exists and is active
        PublicMessageThread thread = publicMessageThreadRepository.findByIdWithDetails(threadId)
                .orElseThrow(() -> new EntityNotFoundException("Thread not found"));

        // Verify user exists
        if (!userRepository.existsByWalletAddress(senderWallet)) {
            throw new EntityNotFoundException("User not found");
        }

        // If replying to a message, verify parent exists
        if (parentMessageId != null) {
            Message parentMessage = messageRepository.findById(parentMessageId)
                    .orElseThrow(() -> new EntityNotFoundException("Parent message not found"));
            
            // Verify parent message belongs to this thread
            if (!parentMessage.getThreadId().equals(threadId) || 
                parentMessage.getThreadType() != Message.ThreadType.PUBLIC) {
                throw new IllegalArgumentException("Parent message does not belong to this thread");
            }
        }

        // Create message
        Message message = Message.builder()
                .threadId(threadId)
                .threadType(Message.ThreadType.PUBLIC)
                .senderWallet(senderWallet)
                .content(content)
                .parentMessageId(parentMessageId)
                .tags(tags)
                .build();

        message = messageRepository.save(message);

        // Create notification if this is a reply (has parent message)
        if (parentMessageId != null) {
            Optional<Message> parentMessage = messageRepository.findById(parentMessageId);
            if (parentMessage.isPresent() && !parentMessage.get().getSenderWallet().equals(senderWallet)) {
                // Notify the original message sender that they got a reply
                notificationService.markUserHasNotifications(parentMessage.get().getSenderWallet());
                log.debug("Created notification for user {} - reply to their public message", parentMessage.get().getSenderWallet());
            }
        }

        // Update thread message count and last message time if it's a top-level message
        if (parentMessageId == null) {
            thread.incrementMessageCount();
            publicMessageThreadRepository.save(thread);
        }

        return convertToPublicMessageDto(message);
    }

    @Transactional
    public void deactivateThread(Long threadId, String userWallet) {
        PublicMessageThread thread = publicMessageThreadRepository.findById(threadId)
                .orElseThrow(() -> new EntityNotFoundException("Thread not found"));

        if (!thread.isCreatedBy(userWallet)) {
            throw new AccessDeniedException("Only thread creator can deactivate the thread");
        }

        thread.setIsActive(false);
        publicMessageThreadRepository.save(thread);
    }

    @Transactional
    public void toggleFeaturedStatus(Long threadId, String adminWallet) {
        PublicMessageThread thread = publicMessageThreadRepository.findById(threadId)
                .orElseThrow(() -> new EntityNotFoundException("Thread not found"));

        // TODO: Add admin role check here
        thread.setIsFeatured(!thread.getIsFeatured());
        publicMessageThreadRepository.save(thread);
    }

    private PublicMessageThreadDto convertToDto(PublicMessageThread thread) {
        UserProfileDto creatorProfile = null;
        if (thread.getCreatorProfile() != null) {
            creatorProfile = userService.getUserProfileDto(thread.getCreatorWallet());
        }

        List<String> interestTags = thread.getInterests().stream()
                .map(InterestTag::getName)
                .collect(Collectors.toList());

        return PublicMessageThreadDto.builder()
                .id(thread.getId())
                .title(thread.getTitle())
                .description(thread.getDescription())
                .creatorWallet(thread.getCreatorWallet())
                .creatorProfile(creatorProfile)
                .lastMessageAt(thread.getLastMessageAt())
                .messageCount(thread.getMessageCount())
                .isActive(thread.getIsActive())
                .isFeatured(thread.getIsFeatured())
                .interestTags(interestTags)
                .createdAt(calendarToLocalDateTime(thread.getCreatedAt()))
                .updatedAt(calendarToLocalDateTime(thread.getUpdatedAt()))
                .build();
    }

    private PublicMessageDto convertToPublicMessageDto(Message message) {
        UserProfileDto senderProfileDto = null;
        try {
            senderProfileDto = userService.getUserProfileDto(message.getSenderWallet());
        } catch (RuntimeException e) {
            // User not found, leave profile null
        }

        Long replyCount = messageRepository.countByParentMessageId(message.getId());

        return PublicMessageDto.builder()
                .id(message.getId())
                .threadId(message.getThreadId())
                .senderWallet(message.getSenderWallet())
                .senderProfile(senderProfileDto)
                .content(message.getContent())
                .parentMessageId(message.getParentMessageId())
                .tags(message.getTags())
                .replyCount(replyCount)
                .createdAt(calendarToLocalDateTime(message.getCreatedAt()))
                .updatedAt(calendarToLocalDateTime(message.getUpdatedAt()))
                .build();
    }

    private LocalDateTime calendarToLocalDateTime(Calendar calendar) {
        if (calendar == null) return null;
        return LocalDateTime.ofInstant(calendar.toInstant(), ZoneId.systemDefault());
    }
}