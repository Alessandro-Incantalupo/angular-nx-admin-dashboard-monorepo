package com.admindashboard.domain;

import com.admindashboard.domain.enumeration.Role;
import com.admindashboard.domain.enumeration.Status;
import io.quarkus.hibernate.orm.panache.PanacheEntityBase;
import io.quarkus.runtime.annotations.RegisterForReflection;
import jakarta.persistence.*;
import java.time.Instant;
import java.util.UUID;

/**
 * Level 2 & 3: Database Entity
 *
 * <p>- Level 2: This is the "Internal Truth" of your data in PostgreSQL. - Level 3: The schema of
 * this table is now MANAGED BY LIQUIBASE. Check
 * src/main/resources/db/changelog/01_initial_schema.xml to see how this table is officially defined
 * in the database.
 */
@Entity
@RegisterForReflection
@Table(name = "ad_user")
public class User extends PanacheEntityBase {

    @Id @GeneratedValue public UUID id;

    @Column(nullable = false)
    public String name;

    @Column(nullable = false, unique = true)
    public String email;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    public Role role;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    public Status status;

    @Column(name = "created_date", nullable = false, updatable = false)
    public Instant createdDate;

    @PrePersist
    public void prePersist() {
        if (createdDate == null) {
            createdDate = Instant.now();
        }
    }

    public User() {}

    public User(String name, String email, Role role, Status status) {
        this.name = name;
        this.email = email;
        this.role = role;
        this.status = status;
    }
}
