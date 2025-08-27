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
@Table(name = "location_tags")
public class LocationTag extends Domain {

    @Column(name = "tag_name", nullable = false, length = 255)
    private String tagName;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(
            name = "user_wallet_address",
            referencedColumnName = "wallet_address",
            foreignKey = @ForeignKey(name = "location_tag_fk_user"),
            nullable = false)
    private User user;
}