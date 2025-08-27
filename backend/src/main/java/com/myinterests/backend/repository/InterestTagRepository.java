package com.myinterests.backend.repository;

import com.myinterests.backend.domain.InterestTag;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.Set;

@Repository
public interface InterestTagRepository extends JpaRepository<InterestTag, Long> {
    List<InterestTag> findByNameContainingIgnoreCaseOrderByName(String name);
    
    Optional<InterestTag> findByNameIgnoreCase(String name);
    
    @Query("SELECT it FROM InterestTag it WHERE it.id IN :ids")
    Set<InterestTag> findByIdIn(@Param("ids") Set<Long> ids);
}