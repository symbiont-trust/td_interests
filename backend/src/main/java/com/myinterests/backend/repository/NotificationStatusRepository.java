package com.myinterests.backend.repository;

import com.myinterests.backend.domain.NotificationStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface NotificationStatusRepository extends JpaRepository<NotificationStatus, String> {
    Optional<NotificationStatus> findByWalletAddress(String walletAddress);
}