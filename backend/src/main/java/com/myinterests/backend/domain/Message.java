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
@Table(name = "messages")
public class Message extends Domain {

    @Column(name = "thread_id", nullable = false)
    private Long threadId;

    @Enumerated(EnumType.STRING)
    @Column(name = "thread_type", nullable = false)
    private ThreadType threadType;

    @Column(name = "sender_wallet", nullable = false, length = 42)
    private String senderWallet;

    @Column(name = "content", nullable = false, columnDefinition = "TEXT")
    private String content;

    @Column(name = "parent_message_id", nullable = true)
    private Long parentMessageId;

    @Column(name = "tags", nullable = true, length = 1000)
    private String tags;

    public enum ThreadType {
        PRIVATE, PUBLIC
    }
}