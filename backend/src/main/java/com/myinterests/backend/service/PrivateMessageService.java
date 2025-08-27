package com.myinterests.backend.service;

import com.myinterests.backend.domain.Message;
import com.myinterests.backend.domain.PrivateMessageThread;
import com.myinterests.backend.repository.MessageRepository;
import com.myinterests.backend.repository.PrivateMessageThreadRepository;
import com.myinterests.backend.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Calendar;
import java.util.Optional;

@Service
@RequiredArgsConstructor
@Slf4j
public class PrivateMessageService {

    private final PrivateMessageThreadRepository threadRepository;
    private final MessageRepository messageRepository;
    private final UserRepository userRepository;
    private final ConnectionService connectionService;
    private final NotificationService notificationService;

    @Transactional
    public PrivateMessageThread createOrGetThread(String user1Wallet, String user2Wallet, String subject) {
        // Verify both users exist
        if (!userRepository.existsByWalletAddress(user1Wallet)) {
            throw new RuntimeException("User " + user1Wallet + " not found");
        }
        if (!userRepository.existsByWalletAddress(user2Wallet)) {
            throw new RuntimeException("User " + user2Wallet + " not found");
        }

        // Check if users are connected
        if (!connectionService.areUsersConnected(user1Wallet, user2Wallet)) {
            throw new RuntimeException("Users are not connected");
        }

        Optional<PrivateMessageThread> existingThread = threadRepository.findByWallets(user1Wallet, user2Wallet);
        
        if (existingThread.isPresent()) {
            return existingThread.get();
        }

        // Create new thread - ensure consistent wallet ordering for easier queries
        String firstWallet = user1Wallet.compareTo(user2Wallet) < 0 ? user1Wallet : user2Wallet;
        String secondWallet = user1Wallet.compareTo(user2Wallet) < 0 ? user2Wallet : user1Wallet;

        PrivateMessageThread thread = PrivateMessageThread.builder()
                .user1Wallet(firstWallet)
                .user2Wallet(secondWallet)
                .subject(subject)
                .isArchivedByUser1(false)
                .isArchivedByUser2(false)
                .unreadCountUser1(0)
                .unreadCountUser2(0)
                .build();

        return threadRepository.save(thread);
    }

    @Transactional
    public Message sendMessage(Long threadId, String senderWallet, String content, Long parentMessageId) {
        PrivateMessageThread thread = threadRepository.findById(threadId)
                .orElseThrow(() -> new RuntimeException("Thread not found"));

        // Verify sender is part of the thread
        if (!thread.includesUser(senderWallet)) {
            throw new RuntimeException("User is not part of this thread");
        }

        // Create the message
        Message message = Message.builder()
                .threadId(threadId)
                .threadType(Message.ThreadType.PRIVATE)
                .senderWallet(senderWallet)
                .content(content)
                .parentMessageId(parentMessageId)
                .build();

        Message savedMessage = messageRepository.save(message);

        // Update thread metadata
        updateThreadAfterMessage(thread, senderWallet);

        // Create notification if this is a reply (has parent message)
        if (parentMessageId != null) {
            // Find the parent message to get the recipient
            Optional<Message> parentMessage = messageRepository.findById(parentMessageId);
            if (parentMessage.isPresent() && !parentMessage.get().getSenderWallet().equals(senderWallet)) {
                // Notify the original message sender that they got a reply
                notificationService.markUserHasNotifications(parentMessage.get().getSenderWallet());
                log.debug("Created notification for user {} - reply to their message", parentMessage.get().getSenderWallet());
            }
        }

        // Also notify the other user in the thread (for new messages)
        String otherUserWallet = thread.getOtherUserWallet(senderWallet);
        notificationService.markUserHasNotifications(otherUserWallet);
        log.debug("Created notification for user {} - new message in thread", otherUserWallet);

        return savedMessage;
    }

    private void updateThreadAfterMessage(PrivateMessageThread thread, String senderWallet) {
        // Update last message time
        thread.setLastMessageAt(Calendar.getInstance());
        
        // Increment unread count for the other user
        if (thread.getUser1Wallet().equals(senderWallet)) {
            thread.setUnreadCountUser2(thread.getUnreadCountUser2() + 1);
        } else {
            thread.setUnreadCountUser1(thread.getUnreadCountUser1() + 1);
        }

        threadRepository.save(thread);
    }

    @Transactional
    public void markThreadAsRead(Long threadId, String userWallet) {
        PrivateMessageThread thread = threadRepository.findById(threadId)
                .orElseThrow(() -> new RuntimeException("Thread not found"));

        if (!thread.includesUser(userWallet)) {
            throw new RuntimeException("User is not part of this thread");
        }

        // Reset unread count for this user
        if (thread.getUser1Wallet().equals(userWallet)) {
            thread.setUnreadCountUser1(0);
        } else {
            thread.setUnreadCountUser2(0);
        }

        threadRepository.save(thread);
    }

    @Transactional
    public void archiveThread(Long threadId, String userWallet, boolean archived) {
        PrivateMessageThread thread = threadRepository.findById(threadId)
                .orElseThrow(() -> new RuntimeException("Thread not found"));

        if (!thread.includesUser(userWallet)) {
            throw new RuntimeException("User is not part of this thread");
        }

        // Set archive status for this user
        if (thread.getUser1Wallet().equals(userWallet)) {
            thread.setIsArchivedByUser1(archived);
        } else {
            thread.setIsArchivedByUser2(archived);
        }

        threadRepository.save(thread);
    }

    public Page<PrivateMessageThread> getUserThreads(String userWallet, boolean archived, int page, int size) {
        Pageable pageable = PageRequest.of(page, size);
        
        if (archived) {
            return threadRepository.findArchivedThreadsByUser(userWallet, pageable);
        } else {
            return threadRepository.findActiveThreadsByUser(userWallet, pageable);
        }
    }

    public Page<Message> getThreadMessages(Long threadId, String userWallet, int page, int size) {
        PrivateMessageThread thread = threadRepository.findById(threadId)
                .orElseThrow(() -> new RuntimeException("Thread not found"));

        if (!thread.includesUser(userWallet)) {
            throw new RuntimeException("User is not part of this thread");
        }

        Pageable pageable = PageRequest.of(page, size);
        return messageRepository.findByThreadIdAndThreadTypeAndParentMessageIdIsNullOrderByCreatedAtDesc(
                threadId, Message.ThreadType.PRIVATE, pageable);
    }

    public Page<Message> getMessageReplies(Long messageId, int page, int size) {
        Pageable pageable = PageRequest.of(page, size);
        return messageRepository.findByParentMessageIdOrderByCreatedAtDesc(messageId, pageable);
    }

    public Long getUnreadCount(String userWallet) {
        Long count = threadRepository.getTotalUnreadCountForUser(userWallet);
        return count != null ? count : 0L;
    }

    public Long getUnreadThreadCount(String userWallet) {
        Long count = threadRepository.getUnreadThreadCountForUser(userWallet);
        return count != null ? count : 0L;
    }

    public PrivateMessageThread getThreadById(Long threadId, String userWallet) {
        PrivateMessageThread thread = threadRepository.findById(threadId)
                .orElseThrow(() -> new RuntimeException("Thread not found"));

        if (!thread.includesUser(userWallet)) {
            throw new RuntimeException("User is not part of this thread");
        }

        return thread;
    }
}