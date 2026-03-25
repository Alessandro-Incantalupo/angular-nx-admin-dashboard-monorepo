package com.admindashboard.service.dto;

import com.admindashboard.domain.Authority;
import com.admindashboard.domain.User;
import com.admindashboard.domain.enumeration.UserStatus;
import io.quarkus.runtime.annotations.RegisterForReflection;
import jakarta.validation.constraints.*;
import java.time.Instant;
import java.util.Set;
import java.util.UUID;
import java.util.stream.Collectors;

/** A DTO representing a user, with his authorities. */
@RegisterForReflection
public class AdminUserDTO {

    public UUID id;

    @NotBlank
    @Size(min = 1, max = 50)
    public String login;

    @Size(max = 50)
    public String name;

    @Email
    @Size(min = 5, max = 254)
    public String email;

    @NotNull public UserStatus status;

    public String createdBy;

    public Instant createdDate;

    public String lastModifiedBy;

    public Instant lastModifiedDate;

    public Set<String> authorities;

    public AdminUserDTO() {
        // Empty constructor needed for Jackson.
    }

    public AdminUserDTO(User user) {
        this.id = user.id;
        this.login = user.login;
        this.name = user.name;
        this.email = user.email;
        this.status = user.status;
        this.createdBy = user.createdBy;
        this.createdDate = user.createdDate;
        this.lastModifiedBy = user.lastModifiedBy;
        this.lastModifiedDate = user.lastModifiedDate;
        this.authorities =
                user.authorities.stream().map(Authority::getName).collect(Collectors.toSet());
    }

    @Override
    public String toString() {
        return "AdminUserDTO{"
                + "id='"
                + id
                + '\''
                + ", name='"
                + name
                + '\''
                + ", email='"
                + email
                + '\''
                + ", status="
                + status
                + ", createdBy="
                + createdBy
                + ", createdDate="
                + createdDate
                + ", lastModifiedBy='"
                + lastModifiedBy
                + '\''
                + ", lastModifiedDate="
                + lastModifiedDate
                + ", authorities="
                + authorities
                + "}";
    }
}
