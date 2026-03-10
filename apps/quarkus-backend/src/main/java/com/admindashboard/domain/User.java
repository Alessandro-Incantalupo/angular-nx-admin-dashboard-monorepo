package com.admindashboard.domain;

import com.admindashboard.domain.enumeration.Role;
import com.admindashboard.domain.enumeration.Status;
import io.quarkus.hibernate.orm.panache.PanacheEntityBase;
import io.quarkus.runtime.annotations.RegisterForReflection;
import jakarta.persistence.*;
import java.util.UUID;

@Entity
@RegisterForReflection
@Table(name = "ad_user")
public class User extends PanacheEntityBase {

    @Id
    @GeneratedValue
    public UUID id;

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

    public User() {}

    public User(String name, String email, Role role, Status status) {
        this.name = name;
        this.email = email;
        this.role = role;
        this.status = status;
    }
}
