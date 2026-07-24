package com.enterprise.spems.controller;

import com.enterprise.spems.dto.ApiResponse;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Collections;
import java.util.List;

@RestController
@RequestMapping("/api/v1/sprints")
public class SprintController {

    @GetMapping
    public ResponseEntity<ApiResponse<List<Object>>> getAllSprints(HttpServletRequest request) {
        return ResponseEntity.ok(ApiResponse.success(Collections.emptyList(), "Sprints retrieved successfully", request.getRequestURI()));
    }
}
