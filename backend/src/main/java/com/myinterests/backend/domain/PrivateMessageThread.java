package com.myinterests.backend.domain;

import jakarta.persistence.*;
import lombok.*;
import lombok.experimental.SuperBuilder;

@Data
@EqualsAndHashCode(callSuper = true, onlyExplicitlyIncluded = true)
@SuperBuilder
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(name = "private_message_threads")
public class PrivateMessageThread extends Domain {

    @Column(name = "user1_wallet", nullable = false, length = 42)
    private String user1Wallet;

    @Column(name = "user2_wallet", nullable = false, length = 42)
    private String user2Wallet;

    @Column(name = "subject", nullable = true, length = 255)
    private String subject;

    @Column(name = "last_message_at")
    private java.util.Calendar lastMessageAt;

    @Column(name = "is_archived_by_user1", nullable = false)
    @Builder.Default
    private Boolean isArchivedByUser1 = false;

    @Column(name = "is_archived_by_user2", nullable = false)
    @Builder.Default
    private Boolean isArchivedByUser2 = false;

    @Column(name = "unread_count_user1", nullable = false)
    @Builder.Default
    private Integer unreadCountUser1 = 0;

    @Column(name = "unread_count_user2", nullable = false)
    @Builder.Default
    private Integer unreadCountUser2 = 0;

    // Helper method to check if a user is part of this thread
    public boolean includesUser(String walletAddress) {
        return user1Wallet.equals(walletAddress) || user2Wallet.equals(walletAddress);
    }

    // Helper method to get the other user's wallet
    public String getOtherUserWallet(String walletAddress) {
        if (user1Wallet.equals(walletAddress)) {
            return user2Wallet;
        } else if (user2Wallet.equals(walletAddress)) {
            return user1Wallet;
        }
        throw new IllegalArgumentException("User " + walletAddress + " is not part of this thread");
    }

    // Helper method to check if thread is archived for a user
    public boolean isArchivedForUser(String walletAddress) {
        if (user1Wallet.equals(walletAddress)) {
            return isArchivedByUser1;
        } else if (user2Wallet.equals(walletAddress)) {
            return isArchivedByUser2;
        }
        return false;
    }

    // Helper method to get unread count for a user
    public int getUnreadCountForUser(String walletAddress) {
        if (user1Wallet.equals(walletAddress)) {
            return unreadCountUser1;
        } else if (user2Wallet.equals(walletAddress)) {
            return unreadCountUser2;
        }
        return 0;
    }
}