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
@Table(name = "continent")
public class Continent extends Domain {

    @Column(name = "name", nullable = false, unique = false, length = 255)
    private String name;
}