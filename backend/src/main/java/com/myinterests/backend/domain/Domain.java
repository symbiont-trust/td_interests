package com.myinterests.backend.domain;

import jakarta.persistence.*;
import lombok.*;
import lombok.experimental.SuperBuilder;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.util.Calendar;

@MappedSuperclass
@SuperBuilder
@Getter
@NoArgsConstructor
@AllArgsConstructor
@EqualsAndHashCode
public class Domain {

    @Getter(AccessLevel.PUBLIC)
    @Id
    @SequenceGenerator(name = "mySeqGen", sequenceName = "myinterests_seq",
            initialValue = 10000,
            allocationSize = 100)
    @GeneratedValue(strategy = GenerationType.SEQUENCE, generator = "mySeqGen")
    @EqualsAndHashCode.Include
    private Long id;

    @Getter(AccessLevel.PUBLIC)
    @Temporal(TemporalType.TIMESTAMP)
    @CreationTimestamp
    @Column(name = "created_at", updatable = false, nullable = false,
            columnDefinition = "TIMESTAMP WITH TIME ZONE")
    private Calendar createdAt;

    @Getter(AccessLevel.PUBLIC)
    @Temporal(TemporalType.TIMESTAMP)
    @UpdateTimestamp
    @Column(name = "updated_at", updatable = true, nullable = false,
            columnDefinition = "TIMESTAMP WITH TIME ZONE")
    private Calendar updatedAt;
}