package com.admindashboard.service.dto;

import com.admindashboard.domain.User;
import io.quarkus.runtime.annotations.RegisterForReflection;
import java.util.UUID;

/** A DTO representing a public user, with only safe information. */
@RegisterForReflection
public class PublicUserDTO {

    public UUID id;

    public String login;

    public String name;

    public PublicUserDTO() {
        // Empty constructor needed for Jackson.
    }

    public PublicUserDTO(User user) {
        this.id = user.id;
        this.name = user.name;
    }

    @Override
    public String toString() {
        return "PublicUserDTO{" + "id='" + id + '\'' + ", name='" + name + '\'' + "}";
    }
}
