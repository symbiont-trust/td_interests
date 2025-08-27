package com.myinterests.backend.repository;

import com.myinterests.backend.domain.LocationTag;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface LocationTagRepository extends JpaRepository<LocationTag, Long> {
    
    List<LocationTag> findByUserWalletAddress(String walletAddress);
    
    @Query("SELECT lt FROM LocationTag lt WHERE lt.tagName LIKE %:tagName%")
    List<LocationTag> findByTagNameContainingIgnoreCase(@Param("tagName") String tagName);
    
    void deleteByUserWalletAddress(String walletAddress);
}