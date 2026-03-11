package com.admindashboard.web.rest;

import com.admindashboard.web.rest.errors.BadRequestAlertException;
import com.admindashboard.web.rest.errors.FieldErrorVM;
import com.admindashboard.web.rest.vm.ResponseWrapper;
import jakarta.ws.rs.*;
import jakarta.ws.rs.core.MediaType;
import jakarta.ws.rs.core.Response;
import java.util.List;
import java.util.Map;

@Path("/api/simulate")
@Produces(MediaType.APPLICATION_JSON)
@Consumes(MediaType.APPLICATION_JSON)
public class ErrorSimulationResource {

    @GET
    @Path("/validation-error")
    public Response simulateValidationError() {
        // Mimic a JHipster validation failure (400)
        Map<String, Object> error =
                Map.of(
                        "title",
                        "Method argument not valid",
                        "status",
                        400,
                        "fieldErrors",
                        List.of(
                                new FieldErrorVM("user", "email", "must be a valid email address"),
                                new FieldErrorVM(
                                        "user", "login", "size must be between 1 and 50")));
        return Response.status(Response.Status.BAD_REQUEST).entity(error).build();
    }

    @GET
    @Path("/bad-request")
    public Response simulateBadRequest() {
        // Throws our custom BadRequestAlertException
        throw new BadRequestAlertException("User already exists", "userManagement", "userexists");
    }

    @GET
    @Path("/server-error")
    public Response simulateServerError() {
        // Generic 500
        return Response.status(Response.Status.INTERNAL_SERVER_ERROR)
                .entity(
                        Map.of(
                                "title",
                                "Internal Server Error",
                                "status",
                                500,
                                "detail",
                                "Something went wrong on our side."))
                .build();
    }

    @GET
    @Path("/envelope")
    public ResponseWrapper<Map<String, String>> simulateEnvelope() {
        // Verify FE unwrapping
        return new ResponseWrapper<>(
                Map.of("status", "System online", "simulated", "true"), "Simulation success", 0);
    }
}
