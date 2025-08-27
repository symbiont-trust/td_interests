package com.myinterests.backend.repository;

import com.myinterests.backend.domain.PrivateMessageThread;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface PrivateMessageThreadRepository extends JpaRepository<PrivateMessageThread, Long> {
    
    @Query("SELECT pmt FROM PrivateMessageThread pmt WHERE (pmt.user1Wallet = :wallet1 AND pmt.user2Wallet = :wallet2) OR (pmt.user1Wallet = :wallet2 AND pmt.user2Wallet = :wallet1)")
    Optional<PrivateMessageThread> findByWallets(@Param("wallet1") String wallet1, @Param("wallet2") String wallet2);
    
    @Query("SELECT pmt FROM PrivateMessageThread pmt WHERE pmt.user1Wallet = :wallet OR pmt.user2Wallet = :wallet ORDER BY pmt.updatedAt DESC")
    List<PrivateMessageThread> findByWallet(@Param("wallet") String wallet);
    
    @Query("SELECT t FROM PrivateMessageThread t WHERE (t.user1Wallet = :wallet OR t.user2Wallet = :wallet) AND ((t.user1Wallet = :wallet AND t.isArchivedByUser1 = false) OR (t.user2Wallet = :wallet AND t.isArchivedByUser2 = false)) ORDER BY t.lastMessageAt DESC NULLS LAST, t.createdAt DESC")
    Page<PrivateMessageThread> findActiveThreadsByUser(@Param("wallet") String walletAddress, Pageable pageable);
    
    @Query("SELECT t FROM PrivateMessageThread t WHERE (t.user1Wallet = :wallet OR t.user2Wallet = :wallet) AND ((t.user1Wallet = :wallet AND t.isArchivedByUser1 = true) OR (t.user2Wallet = :wallet AND t.isArchivedByUser2 = true)) ORDER BY t.lastMessageAt DESC NULLS LAST, t.createdAt DESC")
    Page<PrivateMessageThread> findArchivedThreadsByUser(@Param("wallet") String walletAddress, Pageable pageable);
    
    @Query("SELECT SUM(CASE WHEN t.user1Wallet = :wallet THEN t.unreadCountUser1 ELSE t.unreadCountUser2 END) FROM PrivateMessageThread t WHERE (t.user1Wallet = :wallet OR t.user2Wallet = :wallet) AND ((t.user1Wallet = :wallet AND t.isArchivedByUser1 = false) OR (t.user2Wallet = :wallet AND t.isArchivedByUser2 = false))")
    Long getTotalUnreadCountForUser(@Param("wallet") String walletAddress);
    
    @Query("SELECT COUNT(t) FROM PrivateMessageThread t WHERE (t.user1Wallet = :wallet OR t.user2Wallet = :wallet) AND ((t.user1Wallet = :wallet AND t.unreadCountUser1 > 0 AND t.isArchivedByUser1 = false) OR (t.user2Wallet = :wallet AND t.unreadCountUser2 > 0 AND t.isArchivedByUser2 = false))")
    Long getUnreadThreadCountForUser(@Param("wallet") String walletAddress);
}