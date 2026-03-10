package com.admindashboard.web.rest.vm;

import io.quarkus.runtime.annotations.RegisterForReflection;

/**
 * ResponseWrapper is a generic envelope for all API responses.
 *
 * <p>INTELLIGENT PATTERN: Envelope Pattern This ensures that every successful response follows a
 * consistent structure: { "data": ..., "message": "...", "code": ... }
 *
 * <p>This allows the client to handle metadata (like success messages or app-specific codes)
 * without interfering with the actual entity data.
 *
 * @param <T> The type of the data being wrapped.
 */
@RegisterForReflection
public record ResponseWrapper<T>(T data, String message, Integer code) {

    /**
     * Helper constructor for a standard successful response.
     *
     * @param data The payload.
     */
    public ResponseWrapper(T data) {
        this(data, null, 0);
    }
}
