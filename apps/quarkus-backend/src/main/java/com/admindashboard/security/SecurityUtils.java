package com.admindashboard.security;

import io.quarkus.security.identity.SecurityIdentity;
import jakarta.enterprise.context.RequestScoped;
import jakarta.inject.Inject;
import java.util.Optional;

/** Utility class for security. */
@RequestScoped
public class SecurityUtils {

    @Inject SecurityIdentity securityIdentity;

    /**
     * Get the login of the current user.
     *
     * @return the login of the current user.
     */
    public Optional<String> getCurrentUserLogin() {
        if (securityIdentity.isAnonymous()) {
            return Optional.empty();
        }
        return Optional.of(securityIdentity.getPrincipal().getName());
    }

    /**
     * Check if a user is authenticated.
     *
     * @return true if the user is authenticated, false otherwise.
     */
    public boolean isAuthenticated() {
        return !securityIdentity.isAnonymous();
    }

    /**
     * If the current user has a specific authority.
     *
     * @param authority the authority to check.
     * @return true if the current user has the authority, false otherwise.
     */
    public boolean isCurrentUserInRole(String authority) {
        return securityIdentity.hasRole(authority);
    }
}
