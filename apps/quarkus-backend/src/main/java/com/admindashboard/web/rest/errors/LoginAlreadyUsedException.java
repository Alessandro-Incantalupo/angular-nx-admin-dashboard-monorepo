package com.admindashboard.web.rest.errors;

import java.net.URI;

public class LoginAlreadyUsedException extends BadRequestAlertException {

    private static final long serialVersionUID = 1L;
    private static final URI TYPE =
            URI.create(ErrorConstants.PROBLEM_BASE_URL + "/login-already-used");

    public LoginAlreadyUsedException() {
        super(TYPE, "Login name already used!", "userManagement", "userexists");
    }
}
