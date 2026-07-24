package com.enterprise.spems.controller;

import com.enterprise.spems.dto.ApiResponse;
import com.enterprise.spems.model.entity.AuditLog;
import com.enterprise.spems.model.entity.Employee;
import com.enterprise.spems.model.entity.Notification;
import com.enterprise.spems.model.entity.Project;
import com.enterprise.spems.model.entity.ResourceAllocation;
import com.enterprise.spems.model.entity.Team;
import com.enterprise.spems.repository.AuditLogRepository;
import com.enterprise.spems.repository.EmployeeRepository;
import com.enterprise.spems.repository.NotificationRepository;
import com.enterprise.spems.repository.ProjectRepository;
import com.enterprise.spems.repository.ResourceAllocationRepository;
import com.enterprise.spems.repository.TeamRepository;
import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/v1/resource-allocations")
@RequiredArgsConstructor
public class ResourceAllocationController {

    private final ResourceAllocationRepository resourceAllocationRepository;
    private final EmployeeRepository employeeRepository;
    private final ProjectRepository projectRepository;
    private final TeamRepository teamRepository;
    private final NotificationRepository notificationRepository;
    private final AuditLogRepository auditLogRepository;

    @GetMapping
    public ResponseEntity<ApiResponse<List<ResourceAllocation>>> getAllAllocations(
            @RequestParam(required = false) Long projectId,
            @RequestParam(required = false) Long employeeId,
            HttpServletRequest request) {

        List<ResourceAllocation> list;
        if (projectId != null) {
            list = resourceAllocationRepository.findByProjectId(projectId);
        } else if (employeeId != null) {
            list = resourceAllocationRepository.findByEmployeeId(employeeId);
        } else {
            list = resourceAllocationRepository.findAll();
        }

        return ResponseEntity.ok(ApiResponse.success(list, "Resource allocations retrieved successfully", request.getRequestURI()));
    }

    @PostMapping
    public ResponseEntity<ApiResponse<ResourceAllocation>> allocateResource(
            @RequestBody Map<String, Object> payload,
            HttpServletRequest request) {

        if (payload.get("employeeId") == null || payload.get("projectId") == null) {
            return ResponseEntity.badRequest().body(ApiResponse.error("employeeId and projectId are required", request.getRequestURI()));
        }

        Long employeeId = Long.valueOf(payload.get("employeeId").toString());
        Long projectId = Long.valueOf(payload.get("projectId").toString());

        Employee employee = employeeRepository.findById(employeeId).orElse(null);
        Project project = projectRepository.findById(projectId).orElse(null);

        if (employee == null || project == null) {
            return ResponseEntity.badRequest().body(ApiResponse.error("Invalid employeeId or projectId", request.getRequestURI()));
        }

        Team team = null;
        if (payload.get("teamId") != null && !payload.get("teamId").toString().isEmpty()) {
            Long teamId = Long.valueOf(payload.get("teamId").toString());
            team = teamRepository.findById(teamId).orElse(null);
        }

        String role = (String) payload.getOrDefault("roleOnProject", "Project Contributor");
        Integer allocPercent = payload.get("allocationPercentage") != null
                ? Integer.valueOf(payload.get("allocationPercentage").toString())
                : 100;
        String startDate = (String) payload.getOrDefault("startDate", "2026-07-25");
        String endDate = (String) payload.getOrDefault("endDate", "2026-12-31");
        String billableStatus = (String) payload.getOrDefault("billableStatus", "BILLABLE");

        ResourceAllocation allocation = ResourceAllocation.builder()
                .employee(employee)
                .project(project)
                .team(team)
                .roleOnProject(role)
                .allocationPercentage(allocPercent)
                .startDate(startDate)
                .endDate(endDate)
                .billableStatus(billableStatus)
                .build();

        ResourceAllocation saved = resourceAllocationRepository.save(allocation);

        // Notify Employee if user exists
        if (employee.getUser() != null) {
            Notification notification = Notification.builder()
                    .recipient(employee.getUser())
                    .title("New Project Allocation: " + project.getTitle())
                    .message(String.format("You have been allocated to '%s' as %s (%d%% capacity, %s).",
                            project.getTitle(), role, allocPercent, billableStatus))
                    .linkUrl("/projects/" + project.getId())
                    .isRead(false)
                    .build();
            notificationRepository.save(notification);
        }

        // Create Audit Log
        AuditLog audit = AuditLog.builder()
                .user(employee.getUser())
                .action("RESOURCE_ALLOCATED")
                .entityName("ResourceAllocation")
                .entityId(saved.getId())
                .details(String.format("Allocated %s %s to project '%s' (%d%%)",
                        employee.getFirstName(), employee.getLastName(), project.getTitle(), allocPercent))
                .ipAddress(request.getRemoteAddr())
                .build();
        auditLogRepository.save(audit);

        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success(saved, "Resource allocated successfully to " + project.getTitle(), request.getRequestURI()));
    }
}
