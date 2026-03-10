package com.admindashboard.service;

import com.admindashboard.domain.User;
import com.admindashboard.domain.enumeration.Role;
import com.admindashboard.domain.enumeration.Status;
import com.admindashboard.service.dto.UserDTO;
import com.admindashboard.service.mapper.UserMapper;
import jakarta.enterprise.context.ApplicationScoped;
import jakarta.inject.Inject;
import jakarta.transaction.Transactional;
import java.util.List;
import java.util.Optional;
import java.util.UUID;
import java.util.stream.Collectors;

/**
 * Level 2: Service Layer (The Brain)
 *
 * <p>This class handles all the business logic and database interactions. It is separated from the
 * API layer (UserResource) to keep the code organized.
 *
 * <p>PostgreSQL Tip: We use HQL (Hibernate Query Language) for sorting. "order by createdDate desc"
 * ensures newest users appear first in your Angular UI.
 */
@ApplicationScoped
@Transactional
public class UserService {

    @Inject UserMapper userMapper;

    public List<UserDTO> findAll() {
        return User.<User>find("order by createdDate desc").stream()
                .map(userMapper::toDto)
                .collect(Collectors.toList());
    }

    public List<UserDTO> findPage(int pageIndex, int pageSize) {
        return User.<User>find("order by createdDate desc")
                .page(pageIndex, pageSize)
                .list()
                .stream()
                .map(userMapper::toDto)
                .collect(Collectors.toList());
    }

    public long count() {
        return User.count();
    }

    public Optional<UserDTO> findOne(UUID id) {
        return User.findByIdOptional(id).map(user -> userMapper.toDto((User) user));
    }

    public UserDTO save(UserDTO userDTO) {
        User user = userMapper.toEntity(userDTO);
        user.id = null; // Ensure fresh server-side ID generation
        user.persist();
        return userMapper.toDto(user);
    }

    public Optional<UserDTO> update(UUID id, UserDTO userDTO) {
        return User.<User>findByIdOptional(id)
                .map(
                        existingUser -> {
                            existingUser.name = userDTO.name;
                            existingUser.email = userDTO.email;
                            existingUser.role = userDTO.role;
                            existingUser.status = userDTO.status;
                            return userMapper.toDto(existingUser);
                        });
    }

    public boolean delete(UUID id) {
        return User.deleteById(id);
    }

    public void deleteAll() {
        User.deleteAll();
    }

    @Transactional
    public void seedData() {
        if (User.count() == 0) {
            User.persist(
                    new User("Alice Developer", "alice@example.com", Role.admin, Status.active),
                    new User("Bob Designer", "bob@example.com", Role.user, Status.inactive),
                    new User("Charlie Manager", "charlie@example.com", Role.admin, Status.active),
                    new User("Diana Analyst", "diana@example.com", Role.user, Status.active),
                    new User("Eve Tester", "eve@example.com", Role.user, Status.inactive),
                    new User("Frank Engineer", "frank@example.com", Role.user, Status.active),
                    new User("Grace Architect", "grace@example.com", Role.admin, Status.active),
                    new User("Hank Consultant", "hank@example.com", Role.user, Status.inactive),
                    new User("Ivy Developer", "ivy@example.com", Role.user, Status.active),
                    new User("Jack Support", "jack@example.com", Role.user, Status.inactive));
        }
    }
}
