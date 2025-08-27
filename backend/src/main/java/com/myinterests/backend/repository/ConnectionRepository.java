package com.myinterests.backend.repository;

import com.myinterests.backend.domain.Connection;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ConnectionRepository extends JpaRepository<Connection, Long> {
    
    @Query("SELECT c FROM Connection c WHERE (c.requesterWallet = :wallet1 AND c.recipientWallet = :wallet2) OR (c.requesterWallet = :wallet2 AND c.recipientWallet = :wallet1)")
    Optional<Connection> findByWallets(@Param("wallet1") String wallet1, @Param("wallet2") String wallet2);
    
    List<Connection> findByRequesterWalletAndStatus(String requesterWallet, Connection.ConnectionStatus status);
    List<Connection> findByRecipientWalletAndStatus(String recipientWallet, Connection.ConnectionStatus status);
    
    @Query("SELECT c FROM Connection c WHERE (c.requesterWallet = :wallet OR c.recipientWallet = :wallet) AND c.status = :status")
    List<Connection> findByWalletAndStatus(@Param("wallet") String wallet, @Param("status") Connection.ConnectionStatus status);
    
    @Query("SELECT COUNT(c) FROM Connection c WHERE c.requesterWallet = :requesterWallet AND c.recipientWallet IN :recipientWallets AND c.status = 'ACCEPTED'")
    Long countMutualConnections(@Param("requesterWallet") String requesterWallet, @Param("recipientWallets") List<String> recipientWallets);
    
    @Query("SELECT c FROM Connection c WHERE (c.requesterWallet = :wallet OR c.recipientWallet = :wallet) AND c.status = 'ACCEPTED'")
    List<Connection> findAcceptedConnectionsForUser(@Param("wallet") String wallet);
}