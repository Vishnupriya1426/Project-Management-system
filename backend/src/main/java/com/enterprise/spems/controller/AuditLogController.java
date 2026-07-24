package com.enterprise.spems.controller;

import com.enterprise.spems.dto.ApiResponse;
import com.enterprise.spems.model.entity.AuditLog;
import com.enterprise.spems.repository.AuditLogRepository;
import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/audit-logs")
@RequiredArgsConstructor
public class AuditLogController {

    private final AuditLogRepository auditLogRepository;

    @GetMapping
    public ResponseEntity<ApiResponse<List<AuditLog>>> getAllAuditLogs(HttpServletRequest request) {
        List<AuditLog> logs = auditLogRepository.findAll();
        return ResponseEntity.ok(ApiResponse.success(logs, "Audit security logs retrieved successfully", request.getRequestURI()));
    }
}
