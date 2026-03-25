package com.admindashboard.service.mapper;

import com.admindashboard.domain.Authority;
import com.admindashboard.domain.User;
import com.admindashboard.service.dto.AdminUserDTO;
import com.admindashboard.service.dto.PublicUserDTO;
import com.admindashboard.service.dto.UserDTO;
import java.util.HashSet;
import java.util.Set;
import java.util.UUID;
import java.util.stream.Collectors;
import org.mapstruct.Mapper;

/** Mapper for the entity {@link User} and its DTO {@link UserDTO}. */
@Mapper(componentModel = "jakarta")
public interface UserMapper {
    UserDTO toDto(User user);

    AdminUserDTO toAdminDto(User user);

    PublicUserDTO toPublicDto(User user);

    User toEntity(UserDTO userDto);

    @org.mapstruct.AfterMapping
    default void setRole(@org.mapstruct.MappingTarget UserDTO userDTO, User user) {
        if (userDTO.authorities == null) {
            userDTO.role = "guest";
            return;
        }
        if (userDTO.authorities.contains("ROLE_ADMIN")) {
            userDTO.role = "admin";
        } else if (userDTO.authorities.contains("ROLE_USER")) {
            userDTO.role = "user";
        } else {
            userDTO.role = "guest";
        }
    }

    default Set<String> authoritiesToStrings(Set<Authority> authorities) {
        if (authorities == null) {
            return new HashSet<>();
        }
        return authorities.stream().map(auth -> auth.name).collect(Collectors.toSet());
    }

    default Set<Authority> stringsToAuthorities(Set<String> authoritiesAsString) {
        if (authoritiesAsString == null) {
            return new HashSet<>();
        }
        return authoritiesAsString.stream()
                .map(
                        string -> {
                            Authority auth = new Authority();
                            auth.name = string;
                            return auth;
                        })
                .collect(Collectors.toSet());
    }

    default User fromId(UUID id) {
        if (id == null) {
            return null;
        }
        User user = new User();
        user.id = id;
        return user;
    }
}
