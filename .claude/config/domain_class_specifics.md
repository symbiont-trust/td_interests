# Domain class specifics

All domain classes should extend a class called Domain.

The contents of Domain.java are:

```
@MappedSuperclass
@SuperBuilder
@Getter
@NoArgsConstructor
@AllArgsConstructor
public class Domain {

    @Getter( AccessLevel.PUBLIC )
    @Id
    @SequenceGenerator( name = "mySeqGen", sequenceName = "inmysteps_seq",
            initialValue = 10000,
            allocationSize = 100 )
    @GeneratedValue( strategy = GenerationType.SEQUENCE, generator = "mySeqGen" )
    @EqualsAndHashCode.Include
    private Long id;

    @Getter( AccessLevel.PUBLIC )
    @Temporal( TemporalType.TIMESTAMP )
    @CreationTimestamp
    @Column( name = "created_at", updatable = false, nullable = false,
            columnDefinition = "TIMESTAMP WITH TIME ZONE" )
    private Calendar createdAt;

    @Getter( AccessLevel.PUBLIC )
    @Temporal( TemporalType.TIMESTAMP )
    @UpdateTimestamp
    @Column( name = "updated_at", updatable = true, nullable = false,
            columnDefinition = "TIMESTAMP WITH TIME ZONE" )
    private Calendar updatedAt;
}
```

This is an example of a possible class that extends Domain.  Note that this is just an example and the current requirements do not need an Employer domain.  

```
@Data
@EqualsAndHashCode( callSuper = true, onlyExplicitlyIncluded = true )
@SuperBuilder
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table( name = "employer" )
public class Employer extends Domain {

    @Column( name = "compamy_name", nullable = true, unique = false, length = 256 )
    private String companyName;

    @ManyToOne( )
    @JoinColumn(
            name = "fk_user",
            foreignKey = @ForeignKey( name = "employer_fk_user" ),
            nullable = false )
    private User user;
}
```

Note:

* we are using both Lombok and spring boot annotations


