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
@Table(name = "api_clients")
public class ApiClient extends Domain {

    @Column(name = "client_id", nullable = false, unique = true, length = 255)
    @EqualsAndHashCode.Include
    private String clientId;

    @Column(name = "client_name", nullable = false, length = 255)
    private String clientName;
    
    @Column(name = "is_active", nullable = false)
    @Builder.Default
    private Boolean isActive = true;
}