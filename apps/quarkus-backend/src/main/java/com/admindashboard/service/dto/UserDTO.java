package com.admindashboard.service.dto;

import com.admindashboard.domain.enumeration.Role;
import com.admindashboard.domain.enumeration.Status;
import io.quarkus.runtime.annotations.RegisterForReflection;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import java.time.Instant;
import java.util.UUID;

/** A DTO for the {@link com.admindashboard.domain.User} entity. */
@RegisterForReflection
public class UserDTO {

    public UUID id;

    public Instant createdDate;

    @NotBlank(message = "Name is required")
    public String name;

    @NotBlank(message = "Email is required")
    @Email(message = "Invalid email format")
    public String email;

    @NotNull(message = "Role is required")
    public Role role;

    @NotNull(message = "Status is required")
    public Status status;

    public UserDTO() {}

    @Override
    public String toString() {
        return "UserDTO{"
                + "id="
                + id
                + ", name='"
                + name
                + '\''
                + ", email='"
                + email
                + '\''
                + ", role="
                + role
                + ", status="
                + status
                + '}';
    }
}
