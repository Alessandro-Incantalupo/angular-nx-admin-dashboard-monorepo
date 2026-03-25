package com.admindashboard.service;

import com.admindashboard.domain.Authority;
import com.admindashboard.domain.User;
import com.admindashboard.domain.enumeration.UserStatus;
import com.admindashboard.security.AuthoritiesConstants;
import com.admindashboard.service.dto.UserDTO;
import com.admindashboard.service.mapper.UserMapper;
import com.admindashboard.web.rest.errors.EmailAlreadyUsedException;
import com.admindashboard.web.rest.errors.LoginAlreadyUsedException;
import jakarta.enterprise.context.ApplicationScoped;
import jakarta.inject.Inject;
import jakarta.transaction.Transactional;
import java.util.HashSet;
import java.util.List;
import java.util.Optional;
import java.util.Set;
import java.util.stream.Collectors;
import org.eclipse.microprofile.jwt.Claims;
import org.eclipse.microprofile.jwt.JsonWebToken;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

/**
 * Service class for managing users.
 *
 * <p>In a professional JHipster-style architecture, the Resource (Controller) layer should be thin.
 * All business logic—like password hashing, authority mapping, and auditing—belongs here in the
 * Service layer.
 */
@ApplicationScoped
@Transactional
public class UserService {

    private final Logger log = LoggerFactory.getLogger(UserService.class);

    @Inject UserMapper userMapper;

    /** Create a new user with default authorities. */
    public User createUser(UserDTO userDTO) {
        // Enforce Unique constraints during creation
        if (User.find("login", userDTO.login).firstResultOptional().isPresent()) {
            throw new LoginAlreadyUsedException();
        }
        if (User.find("email", userDTO.email).firstResultOptional().isPresent()) {
            throw new EmailAlreadyUsedException();
        }

        User user = new User();
        user.login = userDTO.login;
        user.name = userDTO.name;
        user.email = userDTO.email;
        user.status = userDTO.status != null ? userDTO.status : UserStatus.ACTIVATED;
        user.createdBy = "system";

        Set<Authority> authorities = new HashSet<>();
        if (userDTO.authorities != null && !userDTO.authorities.isEmpty()) {
            userDTO.authorities.stream()
                    .map(authName -> Authority.<Authority>findByIdOptional(authName))
                    .filter(Optional::isPresent)
                    .map(Optional::get)
                    .forEach(authorities::add);
        } else {
            Authority.<Authority>findByIdOptional(AuthoritiesConstants.USER)
                    .ifPresent(authorities::add);
        }
        user.authorities = authorities;

        user.persist();
        log.debug("Created Information for User: {}", user);
        return user;
    }

    /** Update all information for a specific user. */
    public Optional<UserDTO> updateUser(UserDTO userDTO) {
        return User.<User>findByIdOptional(userDTO.id)
                .map(
                        user -> {
                            // Check if the new email/login is already used by ANOTHER user
                            User.<User>find("login", userDTO.login)
                                    .singleResultOptional()
                                    .filter((User u) -> !u.id.equals(user.id))
                                    .ifPresent(
                                            u -> {
                                                throw new LoginAlreadyUsedException();
                                            });

                            User.<User>find("email", userDTO.email.toLowerCase())
                                    .singleResultOptional()
                                    .filter((User u) -> !u.id.equals(user.id))
                                    .ifPresent(
                                            u -> {
                                                throw new EmailAlreadyUsedException();
                                            });

                            user.login = userDTO.login;
                            user.name = userDTO.name;
                            user.email = userDTO.email.toLowerCase();
                            user.status = userDTO.status;

                            Set<Authority> managedAuthorities = user.authorities;
                            managedAuthorities.clear();
                            if (userDTO.authorities != null) {
                                userDTO.authorities.stream()
                                        .map(
                                                authName ->
                                                        Authority.<Authority>findByIdOptional(
                                                                authName))
                                        .filter(Optional::isPresent)
                                        .map(Optional::get)
                                        .forEach(managedAuthorities::add);
                            }

                            log.debug("Changed Information for User: {}", user);
                            return userMapper.toDto(user);
                        });
    }

    public void deleteUser(User user) {
        user.delete();
        log.debug("Deleted User: {}", user);
    }

    public List<UserDTO> getAllManagedUsers() {
        return User.<User>listAll().stream().map(userMapper::toDto).collect(Collectors.toList());
    }

    public List<String> getAuthorities() {
        return Authority.<Authority>streamAll().map(auth -> auth.name).collect(Collectors.toList());
    }

    public Optional<User> getUserWithAuthoritiesByLogin(String login) {
        return User.find("from User u left join fetch u.authorities where u.login = ?1", login)
                .firstResultOptional();
    }

    /** Synchronize a user from the OIDC authentication principal. */
    @Transactional
    public User getUserFromAuthentication(JsonWebToken token) {
        String login = token.getClaim(Claims.preferred_username);
        if (login == null) {
            login = token.getClaim("upn");
        }
        if (login == null) {
            login = token.getSubject();
        }
        final String userLogin = login;
        log.debug("Synchronizing user with login: {}", userLogin);

        return getUserWithAuthoritiesByLogin(userLogin)
                .orElseGet(
                        () -> {
                            log.info(
                                    "User {} not found, creating from OIDC token claims",
                                    userLogin);
                            User newUser = new User();
                            newUser.login = userLogin;

                            String fullName = token.getClaim(Claims.full_name);
                            if (fullName == null) {
                                String givenName = token.getClaim(Claims.given_name);
                                String familyName = token.getClaim(Claims.family_name);
                                if (givenName != null || familyName != null) {
                                    fullName =
                                            (givenName != null ? givenName : "")
                                                    + (givenName != null && familyName != null
                                                            ? " "
                                                            : "")
                                                    + (familyName != null ? familyName : "");
                                } else {
                                    fullName = userLogin;
                                }
                            }
                            newUser.name = fullName;

                            String email = token.getClaim(Claims.email);
                            if (email == null) {
                                email = userLogin + "@localhost";
                                log.warn(
                                        "Email claim missing for user {}, using fallback: {}",
                                        userLogin,
                                        email);
                            }
                            newUser.email = email;
                            newUser.status = UserStatus.ACTIVATED;
                            newUser.createdBy = "system";

                            Set<Authority> authorities = new HashSet<>();
                            // Map token roles to local authorities if needed, or default to
                            // ROLE_USER
                            Authority.<Authority>findByIdOptional(AuthoritiesConstants.USER)
                                    .ifPresent(authorities::add);
                            newUser.authorities = authorities;

                            newUser.persist();
                            return newUser;
                        });
    }

    public void deleteAll() {
        User.deleteAll();
    }

    public void seedData() {
        log.debug("Seeding demo data...");
        // This would recreate the initial state of the app
        UserDTO admin = new UserDTO();
        admin.login = "admin";
        admin.name = "Alessandro Incantalupo";
        admin.email = "alessandro@example.com";
        admin.status = UserStatus.ACTIVATED;
        admin.authorities = Set.of(AuthoritiesConstants.ADMIN, AuthoritiesConstants.USER);
        createUser(admin);

        UserDTO dev = new UserDTO();
        dev.login = "user";
        dev.name = "John Developer";
        dev.email = "john@example.com";
        dev.status = UserStatus.ACTIVATED;
        dev.authorities = Set.of(AuthoritiesConstants.USER);
        createUser(dev);
    }
}
