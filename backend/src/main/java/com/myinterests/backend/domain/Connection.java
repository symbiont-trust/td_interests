package com.myinterests.backend.domain;

import jakarta.persistence.*;
import lombok.*;
import lombok.experimental.SuperBuilder;

import java.util.Set;

@Data
@EqualsAndHashCode(callSuper = true, onlyExplicitlyIncluded = true)
@SuperBuilder
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(name = "connections")
public class Connection extends Domain {

    @Column(name = "requester_wallet", nullable = false, length = 42)
    private String requesterWallet;

    @Column(name = "recipient_wallet", nullable = false, length = 42)
    private String recipientWallet;

    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false)
    private ConnectionStatus status;

    @ManyToMany(fetch = FetchType.LAZY)
    @JoinTable(
            name = "connection_common_interests",
            joinColumns = @JoinColumn(name = "connection_id"),
            inverseJoinColumns = @JoinColumn(name = "interest_tag_id")
    )
    private Set<InterestTag> commonInterests;

    public enum ConnectionStatus {
        PENDING, ACCEPTED, DISMISSED
    }
    
    public String getOtherUserWallet(String currentUserWallet) {
        if (requesterWallet.equals(currentUserWallet)) {
            return recipientWallet;
        } else if (recipientWallet.equals(currentUserWallet)) {
            return requesterWallet;
        } else {
            throw new IllegalArgumentException("Current user is not part of this connection");
        }
    }
}