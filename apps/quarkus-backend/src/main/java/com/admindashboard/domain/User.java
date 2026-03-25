package com.admindashboard.domain;

import com.admindashboard.domain.enumeration.UserStatus;
import io.quarkus.hibernate.orm.panache.PanacheEntityBase;
import io.quarkus.runtime.annotations.RegisterForReflection;
import jakarta.persistence.*;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import java.time.Instant;
import java.util.HashSet;
import java.util.Set;
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

    @NotNull
    @Size(min = 1, max = 50)
    @Column(length = 50, unique = true, nullable = false)
    public String login;

    @Size(max = 50)
    @Column(length = 50)
    public String name;

    @Email
    @Size(min = 5, max = 254)
    @Column(length = 254, unique = true)
    public String email;

    @NotNull
    @Column(nullable = false)
    @Enumerated(EnumType.STRING)
    public UserStatus status; // Changed type from Status to UserStatus

    @ManyToMany
    @JoinTable(
            name = "ad_user_authority",
            joinColumns = {@JoinColumn(name = "user_id", referencedColumnName = "id")},
            inverseJoinColumns = {
                @JoinColumn(name = "authority_name", referencedColumnName = "name")
            })
    public Set<Authority> authorities = new HashSet<>();

    // --- 🕵️ Auditing Metadata (Phase 3) ---
    // Tracks WHO made changes and WHEN. Professional standard for enterprise apps.

    @NotNull
    @Size(max = 50)
    @Column(name = "created_by", nullable = false, length = 50, updatable = false)
    public String createdBy; // Removed default value

    @NotNull
    @Column(name = "created_date", nullable = false, updatable = false)
    public Instant createdDate = Instant.now();

    @Size(max = 50)
    @Column(name = "last_modified_by", length = 50)
    public String lastModifiedBy;

    @Column(name = "last_modified_date")
    public Instant lastModifiedDate = Instant.now();

    @PrePersist
    public void prePersist() {
        if (this.createdDate == null) {
            this.createdDate = Instant.now();
        }
        this.lastModifiedDate = this.createdDate; // Changed logic for lastModifiedDate on persist
    }

    @PreUpdate
    public void preUpdate() {
        this.lastModifiedDate = Instant.now();
    }

    public User() {}

    public User(String name, String email, UserStatus status) {
        this.name = name;
        this.email = email;
        this.status = status;
    }
}
