package com.admindashboard.service.mapper;

import com.admindashboard.domain.User;
import com.admindashboard.service.dto.UserDTO;
import java.util.UUID;
import org.mapstruct.Mapper;

/** Mapper for the entity {@link User} and its DTO {@link UserDTO}. */
@Mapper(componentModel = "jakarta")
public interface UserMapper {
    UserDTO toDto(User user);

    User toEntity(UserDTO userDto);

    default User fromId(UUID id) {
        if (id == null) {
            return null;
        }
        User user = new User();
        user.id = id;
        return user;
    }
}
