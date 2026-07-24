package com.enterprise.spems.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.Instant;
import java.util.ArrayList;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ApiResponse<T> {

    private boolean success;
    private String message;
    private T data;
    @Builder.Default
    private List<ValidationError> errors = new ArrayList<>();
    @Builder.Default
    private String timestamp = Instant.now().toString();
    private String path;

    public static <T> ApiResponse<T> success(T data, String message, String path) {
        return ApiResponse.<T>builder()
                .success(true)
                .message(message)
                .data(data)
                .errors(new ArrayList<>())
                .timestamp(Instant.now().toString())
                .path(path)
                .build();
    }

    public static <T> ApiResponse<T> success(T data, String message) {
        return success(data, message, null);
    }

    public static <T> ApiResponse<T> error(String message, List<ValidationError> errors, String path) {
        return ApiResponse.<T>builder()
                .success(false)
                .message(message)
                .data(null)
                .errors(errors != null ? errors : new ArrayList<>())
                .timestamp(Instant.now().toString())
                .path(path)
                .build();
    }

    public static <T> ApiResponse<T> error(String message, String path) {
        return error(message, new ArrayList<>(), path);
    }

    @Data
    @AllArgsConstructor
    @NoArgsConstructor
    public static class ValidationError {
        private String field;
        private String message;
    }
}
