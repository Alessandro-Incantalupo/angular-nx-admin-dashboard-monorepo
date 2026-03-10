package com.admindashboard.web.rest;

import com.admindashboard.service.UserService;
import com.admindashboard.service.dto.UserDTO;
import com.admindashboard.web.rest.vm.PaginatedResponse;
import jakarta.inject.Inject;
import jakarta.validation.Valid;
import jakarta.ws.rs.*;
import jakarta.ws.rs.core.MediaType;
import jakarta.ws.rs.core.Response;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import java.util.stream.Collectors;

@Path("/api/users")
@Produces(MediaType.APPLICATION_JSON)
@Consumes(MediaType.APPLICATION_JSON)
public class UserResource {

    @Inject UserService userService;

    @GET
    public PaginatedResponse<UserDTO> getAllUsers(
            @QueryParam("page") @DefaultValue("1") int page,
            @QueryParam("size") @DefaultValue("5") int size) {

        if (page < 1 || size < 1) {
            throw new BadRequestException("Invalid pagination parameters");
        }

        long totalItems = userService.count();
        int totalPages = (int) Math.ceil((double) totalItems / size);
        List<UserDTO> users = userService.findPage(page - 1, size);

        return new PaginatedResponse<>(users, totalItems, totalPages, page, size);
    }

    @GET
    @Path("/stats")
    public Response getStats() {
        List<UserDTO> users = userService.findAll();

        // Ensure even an empty map is returned clearly for the chart
        Map<String, Long> stats =
                users.stream()
                        .collect(
                                Collectors.groupingBy(
                                        u -> u.role.toString(), Collectors.counting()));

        return Response.ok(stats).build();
    }

    @GET
    @Path("/{id}")
    public Response getUser(@PathParam("id") UUID id) {
        return userService
                .findOne(id)
                .map(user -> Response.ok(user).build())
                .orElse(Response.status(Response.Status.NOT_FOUND).build());
    }

    @POST
    public Response createUser(@Valid UserDTO userDTO) {
        // We allow the client to send an ID (common in some SPAs),
        // but our service will ensure a clean persistence.
        UserDTO result = userService.save(userDTO);
        return Response.status(Response.Status.CREATED).entity(result).build();
    }

    @PUT
    @Path("/{id}")
    public Response updateUser(@PathParam("id") UUID id, @Valid UserDTO userDTO) {
        return userService
                .update(id, userDTO)
                .map(result -> Response.ok(result).build())
                .orElse(
                        Response.status(Response.Status.NOT_FOUND)
                                .entity(Map.of("error", "User not found", "id", id))
                                .build());
    }

    @DELETE
    @Path("/{id}")
    public Response deleteUser(@PathParam("id") UUID id) {
        boolean deleted = userService.delete(id);
        if (deleted) {
            return Response.ok(Map.of("id", id, "status", "deleted")).build();
        } else {
            return Response.status(Response.Status.NOT_FOUND)
                    .entity(Map.of("error", "User not found", "id", id))
                    .build();
        }
    }

    @POST
    @Path("/reset")
    public Response resetDemoData() {
        userService.deleteAll();
        userService.seedData(); // Repopulate after deletion
        return Response.ok(Map.of("message", "Demo data reset successfully")).build();
    }
}
