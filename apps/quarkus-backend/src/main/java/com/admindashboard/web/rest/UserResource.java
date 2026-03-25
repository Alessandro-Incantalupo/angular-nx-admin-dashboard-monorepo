package com.admindashboard.web.rest;

import com.admindashboard.service.UserService;
import com.admindashboard.service.dto.UserDTO;
import com.admindashboard.web.rest.errors.BadRequestAlertException;
import com.admindashboard.web.rest.vm.PaginatedResponse;
import com.admindashboard.web.rest.vm.ResponseWrapper;
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
            throw new BadRequestAlertException(
                    "Invalid pagination parameters", "user", "pagination");
        }

        List<UserDTO> allUsers = userService.getAllManagedUsers();
        long totalItems = allUsers.size();
        int totalPages = (int) Math.ceil((double) totalItems / size);

        int fromIndex = (page - 1) * size;
        int toIndex = Math.min(fromIndex + size, (int) totalItems);

        List<UserDTO> paginatedUsers =
                (fromIndex < totalItems) ? allUsers.subList(fromIndex, toIndex) : List.of();

        return new PaginatedResponse<>(paginatedUsers, totalItems, totalPages, page, size);
    }

    @GET
    @Path("/stats")
    public Response getStats() {
        List<UserDTO> users = userService.getAllManagedUsers();

        // Grouping by authorities. We'll join them as a comma-separated string for the chart
        // or just pick the first one which is usually primary.
        Map<String, Long> stats =
                users.stream()
                        .collect(
                                Collectors.groupingBy(
                                        u -> {
                                            if (u.authorities != null
                                                    && u.authorities.contains("ROLE_ADMIN")) {
                                                return "Admin";
                                            }
                                            return "User";
                                        },
                                        Collectors.counting()));

        return Response.ok(stats).build();
    }

    @GET
    @Path("/{id}")
    public Response getUser(@PathParam("id") UUID id) {
        return com.admindashboard.domain.User.<com.admindashboard.domain.User>findByIdOptional(id)
                .map(user -> Response.ok(new ResponseWrapper<>(new UserDTO(user))).build())
                .orElse(Response.status(Response.Status.NOT_FOUND).build());
    }

    @POST
    public Response createUser(@Valid UserDTO userDTO) {
        // Business logic delegated to service layer
        com.admindashboard.domain.User result = userService.createUser(userDTO);
        return Response.status(Response.Status.CREATED)
                .entity(new ResponseWrapper<>(new UserDTO(result)))
                .build();
    }

    @PUT
    @Path("/{id}")
    public Response updateUser(@PathParam("id") UUID id, @Valid UserDTO userDTO) {
        userDTO.id = id;
        return userService
                .updateUser(userDTO)
                .map(result -> Response.ok(new ResponseWrapper<>(result)).build())
                .orElse(
                        Response.status(Response.Status.NOT_FOUND)
                                .entity(Map.of("error", "User not found", "id", id))
                                .build());
    }

    @DELETE
    @Path("/{id}")
    public Response deleteUser(@PathParam("id") UUID id) {
        return com.admindashboard.domain.User.<com.admindashboard.domain.User>findByIdOptional(id)
                .map(
                        user -> {
                            userService.deleteUser(user);
                            return Response.ok(
                                            new ResponseWrapper<>(
                                                    Map.of("id", id, "status", "deleted")))
                                    .build();
                        })
                .orElse(
                        Response.status(Response.Status.NOT_FOUND)
                                .entity(Map.of("error", "User not found", "id", id))
                                .build());
    }

    @POST
    @Path("/reset")
    public Response resetDemoData() {
        userService.deleteAll();
        userService.seedData(); // Repopulate after deletion
        return Response.ok(Map.of("message", "Demo data reset successfully")).build();
    }
}
