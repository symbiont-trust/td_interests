package com.myinterests.backend.domain;

import jakarta.persistence.*;
import lombok.*;
import lombok.experimental.SuperBuilder;

import java.time.LocalDateTime;
import java.util.Set;

@Data
@EqualsAndHashCode(callSuper = true, onlyExplicitlyIncluded = true)
@SuperBuilder
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(name = "public_message_threads")
public class PublicMessageThread extends Domain {

    @Column(name = "creator_wallet", nullable = false, length = 42)
    private String creatorWallet;

    @Column(name = "title", nullable = false, length = 255)
    private String title;

    @Column(name = "description", columnDefinition = "TEXT")
    private String description;

    @Column(name = "last_message_at")
    private LocalDateTime lastMessageAt;

    @Column(name = "message_count", nullable = false)
    @Builder.Default
    private Long messageCount = 0L;

    @Column(name = "is_active", nullable = false)
    @Builder.Default
    private Boolean isActive = true;

    @Column(name = "is_featured", nullable = false)
    @Builder.Default
    private Boolean isFeatured = false;

    @ManyToMany(fetch = FetchType.LAZY)
    @JoinTable(
            name = "public_thread_interests",
            joinColumns = @JoinColumn(name = "thread_id"),
            inverseJoinColumns = @JoinColumn(name = "interest_tag_id")
    )
    private Set<InterestTag> interests;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "creator_wallet", referencedColumnName = "wallet_address", insertable = false, updatable = false)
    private User creatorProfile;

    public void incrementMessageCount() {
        this.messageCount++;
        this.lastMessageAt = LocalDateTime.now();
        // updatedAt will be automatically set by @UpdateTimestamp
    }

    public boolean isCreatedBy(String walletAddress) {
        return this.creatorWallet.equals(walletAddress);
    }
}