package com.myinterests.backend.repository;

import com.myinterests.backend.domain.PublicMessageThread;
import com.myinterests.backend.domain.InterestTag;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.Set;

@Repository
public interface PublicMessageThreadRepository extends JpaRepository<PublicMessageThread, Long> {
    
    // Find threads by creator
    Page<PublicMessageThread> findByCreatorWalletAndIsActiveOrderByUpdatedAtDesc(String creatorWallet, Boolean isActive, Pageable pageable);
    
    // Find active threads
    Page<PublicMessageThread> findByIsActiveTrueOrderByLastMessageAtDescUpdatedAtDesc(Pageable pageable);
    
    // Find featured threads
    Page<PublicMessageThread> findByIsFeaturedTrueAndIsActiveTrueOrderByUpdatedAtDesc(Pageable pageable);
    
    // Find threads by interests with join fetch for performance
    @Query("SELECT DISTINCT pmt FROM PublicMessageThread pmt " +
           "LEFT JOIN FETCH pmt.creatorProfile " +
           "LEFT JOIN FETCH pmt.interests i " +
           "WHERE i IN :interests AND pmt.isActive = true " +
           "ORDER BY pmt.lastMessageAt DESC, pmt.updatedAt DESC")
    Page<PublicMessageThread> findByInterestsInAndIsActiveTrue(@Param("interests") Set<InterestTag> interests, Pageable pageable);
    
    // Search threads by title
    @Query("SELECT pmt FROM PublicMessageThread pmt " +
           "LEFT JOIN FETCH pmt.creatorProfile " +
           "WHERE LOWER(pmt.title) LIKE LOWER(CONCAT('%', :title, '%')) " +
           "AND pmt.isActive = true " +
           "ORDER BY pmt.lastMessageAt DESC, pmt.updatedAt DESC")
    Page<PublicMessageThread> findByTitleContainingIgnoreCaseAndIsActiveTrue(@Param("title") String title, Pageable pageable);
    
    // Find thread with creator profile for detailed view
    @Query("SELECT pmt FROM PublicMessageThread pmt " +
           "LEFT JOIN FETCH pmt.creatorProfile " +
           "LEFT JOIN FETCH pmt.interests " +
           "WHERE pmt.id = :id AND pmt.isActive = true")
    Optional<PublicMessageThread> findByIdWithDetails(@Param("id") Long id);
    
    // Find popular threads based on recent activity
    @Query("SELECT pmt FROM PublicMessageThread pmt " +
           "LEFT JOIN FETCH pmt.creatorProfile " +
           "WHERE pmt.isActive = true " +
           "AND pmt.lastMessageAt IS NOT NULL " +
           "ORDER BY pmt.messageCount DESC, pmt.lastMessageAt DESC")
    Page<PublicMessageThread> findPopularThreads(Pageable pageable);
    
    // Count threads by interest
    @Query("SELECT COUNT(DISTINCT pmt) FROM PublicMessageThread pmt " +
           "JOIN pmt.interests i " +
           "WHERE i.id = :interestId AND pmt.isActive = true")
    Long countByInterestId(@Param("interestId") Long interestId);
}