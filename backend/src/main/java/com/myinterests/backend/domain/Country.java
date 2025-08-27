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
@Table(name = "country")
public class Country extends Domain {

    @Column(name = "name", nullable = false, unique = false, length = 255)
    private String name;

    @ManyToOne
    @JoinColumn(
            name = "fk_continent",
            foreignKey = @ForeignKey(name = "country_fk_continent"),
            nullable = false)
    private Continent continent;
}