package com.enterprise.spems.controller;

import com.enterprise.spems.dto.ApiResponse;
import com.enterprise.spems.model.entity.AuditLog;
import com.enterprise.spems.model.entity.Employee;
import com.enterprise.spems.model.entity.Milestone;
import com.enterprise.spems.model.entity.Project;
import com.enterprise.spems.repository.AuditLogRepository;
import com.enterprise.spems.repository.EmployeeRepository;
import com.enterprise.spems.repository.MilestoneRepository;
import com.enterprise.spems.repository.ProjectRepository;
import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/v1/milestones")
@RequiredArgsConstructor
public class MilestoneController {

    private final MilestoneRepository milestoneRepository;
    private final ProjectRepository projectRepository;
    private final EmployeeRepository employeeRepository;
    private final AuditLogRepository auditLogRepository;

    @GetMapping
    public ResponseEntity<ApiResponse<List<Milestone>>> getAllMilestones(
            @RequestParam(required = false) Long projectId,
            HttpServletRequest request) {

        List<Milestone> milestones = (projectId != null)
                ? milestoneRepository.findByProjectId(projectId)
                : milestoneRepository.findAll();

        return ResponseEntity.ok(ApiResponse.success(milestones, "Milestones retrieved successfully", request.getRequestURI()));
    }

    @PostMapping
    public ResponseEntity<ApiResponse<Milestone>> createMilestone(
            @RequestBody Map<String, Object> payload,
            HttpServletRequest request) {

        if (payload.get("milestoneName") == null || payload.get("projectId") == null) {
            return ResponseEntity.badRequest().body(ApiResponse.error("milestoneName and projectId are required", request.getRequestURI()));
        }

        String milestoneName = (String) payload.get("milestoneName");
        Long projectId = Long.valueOf(payload.get("projectId").toString());

        Project project = projectRepository.findById(projectId).orElse(null);
        if (project == null) {
            return ResponseEntity.badRequest().body(ApiResponse.error("Project not found", request.getRequestURI()));
        }

        Employee owner = null;
        if (payload.get("ownerId") != null && !payload.get("ownerId").toString().isEmpty()) {
            Long ownerId = Long.valueOf(payload.get("ownerId").toString());
            owner = employeeRepository.findById(ownerId).orElse(null);
        }

        String dueDate = (String) payload.getOrDefault("dueDate", "2026-12-31");
        String description = (String) payload.getOrDefault("description", "");

        Milestone milestone = Milestone.builder()
                .milestoneName(milestoneName)
                .project(project)
                .owner(owner)
                .dueDate(dueDate)
                .description(description)
                .completionPct(0)
                .status("IN_PROGRESS")
                .build();

        Milestone saved = milestoneRepository.save(milestone);

        // Create Audit Log
        AuditLog audit = AuditLog.builder()
                .action("MILESTONE_CREATED")
                .entityName("Milestone")
                .entityId(saved.getId())
                .details("Created Milestone '" + saved.getMilestoneName() + "' for project " + project.getTitle())
                .ipAddress(request.getRemoteAddr())
                .build();
        auditLogRepository.save(audit);

        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success(saved, "Milestone created successfully", request.getRequestURI()));
    }

    @PutMapping("/{id}/status")
    public ResponseEntity<ApiResponse<Milestone>> updateMilestoneStatus(
            @PathVariable Long id,
            @RequestBody Map<String, Object> payload,
            HttpServletRequest request) {

        return milestoneRepository.findById(id)
                .map(milestone -> {
                    if (payload.containsKey("completionPct")) {
                        int pct = Integer.parseInt(payload.get("completionPct").toString());
                        milestone.setCompletionPct(Math.min(100, Math.max(0, pct)));
                    }

                    if (payload.containsKey("status")) {
                        milestone.setStatus(payload.get("status").toString());
                    }

                    if (milestone.getCompletionPct() >= 100) {
                        milestone.setStatus("COMPLETED");
                    }

                    Milestone updated = milestoneRepository.save(milestone);

                    // Auto-recalculate project progress percentage
                    Project project = updated.getProject();
                    if (project != null) {
                        List<Milestone> pMilestones = milestoneRepository.findByProjectId(project.getId());
                        if (!pMilestones.isEmpty()) {
                            double avgPct = pMilestones.stream().mapToInt(Milestone::getCompletionPct).average().orElse(0.0);
                            project.setProgressPercentage(Math.round(avgPct * 10.0) / 10.0);
                            projectRepository.save(project);
                        }
                    }

                    return ResponseEntity.ok(ApiResponse.success(updated, "Milestone status updated successfully", request.getRequestURI()));
                })
                .orElseGet(() -> ResponseEntity.notFound().build());
    }
}
