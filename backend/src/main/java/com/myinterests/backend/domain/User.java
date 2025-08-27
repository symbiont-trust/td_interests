package com.myinterests.backend.domain;

import jakarta.persistence.*;
import lombok.*;
import lombok.experimental.SuperBuilder;

import java.util.Set;

@Data
@EqualsAndHashCode(callSuper = true, onlyExplicitlyIncluded = true)
@SuperBuilder
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(name = "users")
public class User extends Domain {

    @Column(name = "wallet_address", nullable = false, unique = true, length = 42)
    @EqualsAndHashCode.Include
    private String walletAddress;

    @Column(name = "handle", nullable = false, unique = false, length = 255)
    private String handle;

    @ManyToOne
    @JoinColumn(
            name = "fk_country",
            foreignKey = @ForeignKey(name = "users_fk_country"),
            nullable = true)
    private Country country;

    @OneToMany(mappedBy = "user", fetch = FetchType.LAZY, cascade = CascadeType.ALL, orphanRemoval = true)
    private Set<LocationTag> locationTags;

    @ManyToMany(fetch = FetchType.LAZY)
    @JoinTable(
            name = "user_interests",
            joinColumns = @JoinColumn(name = "user_wallet_address", referencedColumnName = "wallet_address"),
            inverseJoinColumns = @JoinColumn(name = "interest_tag_id")
    )
    private Set<InterestTag> interests;
}