package com.myinterests.backend.domain;

import jakarta.persistence.*;
import lombok.*;
import lombok.experimental.SuperBuilder;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.util.Calendar;

@Data
@EqualsAndHashCode(onlyExplicitlyIncluded = true)
@SuperBuilder
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(name = "notification_status")
public class NotificationStatus {

    @Id
    @Column(name = "wallet_address", nullable = false, unique = true, length = 42)
    @EqualsAndHashCode.Include
    private String walletAddress;

    @Column(name = "has_notifications", nullable = false)
    private Boolean hasNotifications;

    @Temporal(TemporalType.TIMESTAMP)
    @CreationTimestamp
    @Column(name = "created_at", updatable = false, nullable = false,
            columnDefinition = "TIMESTAMP WITH TIME ZONE")
    private Calendar createdAt;

    @Temporal(TemporalType.TIMESTAMP)
    @UpdateTimestamp
    @Column(name = "updated_at", updatable = true, nullable = false,
            columnDefinition = "TIMESTAMP WITH TIME ZONE")
    private Calendar updatedAt;
}