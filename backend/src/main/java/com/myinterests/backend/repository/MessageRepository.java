package com.myinterests.backend.repository;

import com.myinterests.backend.domain.Message;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface MessageRepository extends JpaRepository<Message, Long> {
    
    Page<Message> findByThreadIdAndThreadTypeAndParentMessageIdIsNullOrderByCreatedAtDesc(
        Long threadId, 
        Message.ThreadType threadType, 
        Pageable pageable);
    
    Page<Message> findByParentMessageIdOrderByCreatedAtDesc(Long parentMessageId, Pageable pageable);
    
    Long countByParentMessageId(Long parentMessageId);
    
    @Query("SELECT m FROM Message m WHERE m.threadId = :threadId AND m.threadType = :threadType AND m.tags LIKE %:tag%")
    Page<Message> findByThreadIdAndThreadTypeAndTagsContaining(
        @Param("threadId") Long threadId,
        @Param("threadType") Message.ThreadType threadType,
        @Param("tag") String tag,
        Pageable pageable);
    
    List<Message> findByThreadIdAndThreadTypeOrderByCreatedAtDesc(Long threadId, Message.ThreadType threadType);
}