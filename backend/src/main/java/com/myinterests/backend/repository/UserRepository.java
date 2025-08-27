package com.myinterests.backend.repository;

import com.myinterests.backend.domain.User;
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
public interface UserRepository extends JpaRepository<User, Long> {
    Optional<User> findByWalletAddress(String walletAddress);
    
    @Query("SELECT u FROM User u JOIN u.interests i WHERE i IN :interests AND u.walletAddress != :excludeWallet")
    Page<User> findByInterestsIn(@Param("interests") Set<InterestTag> interests, 
                               @Param("excludeWallet") String excludeWallet, 
                               Pageable pageable);
    
    @Query("SELECT DISTINCT u FROM User u LEFT JOIN u.locationTags lt WHERE (lt.tagName LIKE %:locationTag% OR u.country.name LIKE %:locationTag%) AND u.walletAddress != :excludeWallet")
    Page<User> findByLocationTagsContainingIgnoreCaseOrCountryNameContainingIgnoreCase(
        @Param("locationTag") String locationTag,
        @Param("excludeWallet") String excludeWallet,
        Pageable pageable);
        
    @Query("SELECT DISTINCT u FROM User u JOIN u.interests i LEFT JOIN u.locationTags lt WHERE " +
           "(:interests IS NULL OR i IN :interests) AND " +
           "(:locationTag IS NULL OR lt.tagName LIKE %:locationTag% OR u.country.name LIKE %:locationTag%) AND " +
           "(:countryId IS NULL OR u.country.id = :countryId) AND " +
           "u.walletAddress != :excludeWallet")
    Page<User> findBySearchCriteria(
        @Param("interests") Set<InterestTag> interests,
        @Param("locationTag") String locationTag,
        @Param("countryId") Long countryId,
        @Param("excludeWallet") String excludeWallet,
        Pageable pageable);
        
    boolean existsByWalletAddress(String walletAddress);
}