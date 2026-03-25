package com.admindashboard.web.rest;

import com.admindashboard.security.SecurityUtils;
import com.admindashboard.service.UserService;
import com.admindashboard.service.dto.AdminUserDTO;
import jakarta.enterprise.context.RequestScoped;
import jakarta.inject.Inject;
import jakarta.ws.rs.GET;
import jakarta.ws.rs.Path;
import jakarta.ws.rs.Produces;
import jakarta.ws.rs.core.MediaType;
import jakarta.ws.rs.core.Response;
import java.util.Optional;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

/** REST controller for managing the current user's account. */
@Path("/api/account")
@Produces(MediaType.APPLICATION_JSON)
@RequestScoped
public class AccountResource {

    private final Logger log = LoggerFactory.getLogger(AccountResource.class);

    @Inject UserService userService;

    @Inject SecurityUtils securityUtils;

    @Inject org.eclipse.microprofile.jwt.JsonWebToken jwt;

    /**
     * {@code GET /api/account} : get the current user.
     *
     * @return the current user.
     * @throws RuntimeException {@code 500 (Internal Server Error)} if the user couldn't be
     *     returned.
     */
    @GET
    public Response getAccount() {
        if (!securityUtils.isAuthenticated()) {
            return Response.status(Response.Status.UNAUTHORIZED).build();
        }

        return Optional.ofNullable(userService.getUserFromAuthentication(jwt))
                .map(user -> Response.ok(new AdminUserDTO(user)).build())
                .orElse(Response.status(Response.Status.INTERNAL_SERVER_ERROR).build());
    }
}
