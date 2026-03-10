package com.admindashboard.web.rest.vm;

import io.quarkus.runtime.annotations.RegisterForReflection;
import java.util.List;

@RegisterForReflection
public record PaginatedResponse<T>(
    List<T> data,
    ResponseMeta meta,
    String message,
    Integer code
) {
    public PaginatedResponse(List<T> data, long totalItems, int totalPages, int currentPage, int pageSize) {
        this(data, new ResponseMeta(totalItems, totalPages, currentPage, pageSize), null, null);
    }
}

@RegisterForReflection
record ResponseMeta(
    long totalItems,
    int totalPages,
    int currentPage,
    int pageSize
) {}
