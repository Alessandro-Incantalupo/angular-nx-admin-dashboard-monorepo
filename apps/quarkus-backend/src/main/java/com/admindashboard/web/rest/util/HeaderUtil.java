package com.admindashboard.web.rest.util;

import jakarta.ws.rs.core.Response;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

/** Utility class for HTTP headers messages. */
public final class HeaderUtil {

    private static final Logger log = LoggerFactory.getLogger(HeaderUtil.class);

    private static final String APPLICATION_NAME = "adminDashboard";

    private HeaderUtil() {}

    /**
     * createAlert.
     *
     * @param message a {@link java.lang.String} object.
     * @param param a {@link java.lang.String} object.
     * @return a {@link jakarta.ws.rs.core.Response.ResponseBuilder} object.
     */
    public static Response.ResponseBuilder createAlert(String message, String param) {
        return Response.ok()
                .header("X-" + APPLICATION_NAME + "-alert", message)
                .header("X-" + APPLICATION_NAME + "-params", param);
    }

    /**
     * createEntityCreationAlert.
     *
     * @param entityName a {@link java.lang.String} object.
     * @param param a {@link java.lang.String} object.
     * @return a {@link jakarta.ws.rs.core.Response.ResponseBuilder} object.
     */
    public static Response.ResponseBuilder createEntityCreationAlert(
            String entityName, String param) {
        return createAlert(APPLICATION_NAME + "." + entityName + ".created", param);
    }

    /**
     * createEntityUpdateAlert.
     *
     * @param entityName a {@link java.lang.String} object.
     * @param param a {@link java.lang.String} object.
     * @return a {@link jakarta.ws.rs.core.Response.ResponseBuilder} object.
     */
    public static Response.ResponseBuilder createEntityUpdateAlert(
            String entityName, String param) {
        return createAlert(APPLICATION_NAME + "." + entityName + ".updated", param);
    }

    /**
     * createEntityDeletionAlert.
     *
     * @param entityName a {@link java.lang.String} object.
     * @param param a {@link java.lang.String} object.
     * @return a {@link jakarta.ws.rs.core.Response.ResponseBuilder} object.
     */
    public static Response.ResponseBuilder createEntityDeletionAlert(
            String entityName, String param) {
        return createAlert(APPLICATION_NAME + "." + entityName + ".deleted", param);
    }

    /**
     * createFailureAlert.
     *
     * @param entityName a {@link java.lang.String} object.
     * @param errorKey a {@link java.lang.String} object.
     * @param defaultMessage a {@link java.lang.String} object.
     * @return a {@link jakarta.ws.rs.core.Response.ResponseBuilder} object.
     */
    public static Response.ResponseBuilder createFailureAlert(
            String entityName, String errorKey, String defaultMessage) {
        log.error("Entity processing failed, {}", defaultMessage);
        return Response.status(Response.Status.BAD_REQUEST)
                .header("X-" + APPLICATION_NAME + "-error", "error." + errorKey)
                .header("X-" + APPLICATION_NAME + "-params", entityName);
    }
}
