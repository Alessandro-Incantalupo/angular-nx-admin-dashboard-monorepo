package com.admindashboard.web.rest;

import com.admindashboard.domain.User;
import com.admindashboard.web.rest.vm.PaginatedResponse;
import jakarta.transaction.Transactional;
import jakarta.ws.rs.*;
import jakarta.ws.rs.core.MediaType;
import jakarta.ws.rs.core.Response;
import java.util.List;
import java.util.UUID;

@Path("/api/users")
@Produces(MediaType.APPLICATION_JSON)
@Consumes(MediaType.APPLICATION_JSON)
public class UserResource {

    @GET
    public PaginatedResponse<User> getAllUsers(
            @QueryParam("page") @DefaultValue("1") int page,
            @QueryParam("size") @DefaultValue("5") int size) {
        
        if (page < 1 || size < 1) {
            throw new BadRequestException("Invalid pagination parameters");
        }

        long totalItems = User.count();
        int totalPages = (int) Math.ceil((double) totalItems / size);

        List<User> users = User.findAll().page(page - 1, size).list();

        return new PaginatedResponse<>(users, totalItems, totalPages, page, size);
    }

    @GET
    @Path("/stats")
    public Response getStats() {
        // Simple map generation for role stats
        List<User> users = User.listAll();
        return Response.ok(users.stream()
                .collect(java.util.stream.Collectors.groupingBy(u -> u.role, java.util.stream.Collectors.counting())))
                .build();
    }

    @GET
    @Path("/{id}")
    public Response getUser(@PathParam("id") UUID id) {
        return User.findByIdOptional(id)
                .map(user -> Response.ok(user).build())
                .orElse(Response.status(Response.Status.NOT_FOUND).build());
    }

    @POST
    @Transactional
    public Response createUser(User user) {
        if (user.id != null) {
            return Response.status(Response.Status.BAD_REQUEST).entity("A new user cannot already have an ID").build();
        }
        user.persist();
        return Response.status(Response.Status.CREATED).entity(user).build();
    }

    @PUT
    @Path("/{id}")
    @Transactional
    public Response updateUser(@PathParam("id") UUID id, User user) {
        return User.<User>findByIdOptional(id)
                .map(existingUser -> {
                    existingUser.name = user.name;
                    existingUser.email = user.email;
                    existingUser.role = user.role;
                    existingUser.status = user.status;
                    return Response.ok(existingUser).build();
                })
                .orElse(Response.status(Response.Status.NOT_FOUND).build());
    }

    @DELETE
    @Path("/{id}")
    @Transactional
    public Response deleteUser(@PathParam("id") UUID id) {
        boolean deleted = User.deleteById(id);
        if (deleted) {
            return Response.noContent().build();
        } else {
            return Response.status(Response.Status.NOT_FOUND).build();
        }
    }
    @POST
    @Path("/reset")
    @Transactional
    public Response resetDemoData() {
        User.deleteAll();
        return Response.accepted().build();
    }
}
