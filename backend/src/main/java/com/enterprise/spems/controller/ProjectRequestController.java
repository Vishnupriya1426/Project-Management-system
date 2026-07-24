package com.enterprise.spems.controller;

import com.enterprise.spems.dto.ApiResponse;
import com.enterprise.spems.model.entity.*;
import com.enterprise.spems.model.enums.ProjectStatus;
import com.enterprise.spems.repository.*;
import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/v1")
@RequiredArgsConstructor
public class ProjectRequestController {

    private final ProjectProposalRepository projectProposalRepository;
    private final ProjectRepository projectRepository;
    private final EmployeeRepository employeeRepository;
    private final ClientRepository clientRepository;
    private final NotificationRepository notificationRepository;

    @GetMapping("/admin/project-requests")
    public ResponseEntity<ApiResponse<List<ProjectProposal>>> getAllProjectRequests(HttpServletRequest request) {
        List<ProjectProposal> proposals = projectProposalRepository.findAllByOrderByIdDesc();
        return ResponseEntity.ok(ApiResponse.success(proposals, "Project proposals retrieved successfully", request.getRequestURI()));
    }

    @PostMapping("/client/project-requests")
    public ResponseEntity<ApiResponse<ProjectProposal>> createProjectRequest(@RequestBody ProjectProposal proposal, HttpServletRequest request) {
        if (proposal.getStatus() == null || proposal.getStatus().isBlank()) {
            proposal.setStatus("PENDING_REVIEW");
        }
        ProjectProposal created = projectProposalRepository.save(proposal);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success(created, "Project request submitted successfully", request.getRequestURI()));
    }

    @PostMapping("/admin/project-requests/{id}/accept")
    public ResponseEntity<ApiResponse<Map<String, Object>>> acceptProjectRequest(@PathVariable Long id, HttpServletRequest request) {
        ProjectProposal proposal = projectProposalRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Project proposal not found: " + id));

        proposal.setStatus("ACCEPTED");
        ProjectProposal updated = projectProposalRepository.save(proposal);

        Long createdProjectId = null;
        // Auto-create real active project in SPEMS system
        try {
            BigDecimal budget = null;
            if (proposal.getEstimatedBudget() != null) {
                try {
                    String numOnly = proposal.getEstimatedBudget().replaceAll("[^0-9.]", "");
                    if (!numOnly.isEmpty()) {
                        budget = new BigDecimal(numOnly);
                    }
                } catch (Exception ignored) {}
            }

            LocalDate startDate = null;
            if (proposal.getExpectedStartDate() != null && !proposal.getExpectedStartDate().isBlank()) {
                try {
                    startDate = LocalDate.parse(proposal.getExpectedStartDate());
                } catch (Exception ignored) {}
            }

            LocalDate endDate = null;
            if (proposal.getExpectedEndDate() != null && !proposal.getExpectedEndDate().isBlank()) {
                try {
                    endDate = LocalDate.parse(proposal.getExpectedEndDate());
                } catch (Exception ignored) {}
            }

            Client mappedClient = null;
            if (proposal.getClientOrganization() != null) {
                mappedClient = clientRepository.findAll().stream()
                        .filter(c -> c.getCompanyName() != null && c.getCompanyName().equalsIgnoreCase(proposal.getClientOrganization()))
                        .findFirst().orElse(null);
            }

            Project project = Project.builder()
                    .title(proposal.getTitle())
                    .projectCode("PRJ-2026-00" + proposal.getId())
                    .description(proposal.getDescription() != null ? proposal.getDescription() : proposal.getBusinessObjective())
                    .status(ProjectStatus.IN_PROGRESS)
                    .budget(budget)
                    .startDate(startDate)
                    .endDate(endDate)
                    .techStack(proposal.getTechnologyStack())
                    .client(mappedClient)
                    .progressPercentage(10.0)
                    .build();
            Project savedProject = projectRepository.save(project);
            createdProjectId = savedProject.getId();
        } catch (Exception ignored) {}

        Map<String, Object> resp = new HashMap<>();
        resp.put("proposal", updated);
        resp.put("projectId", createdProjectId);

        return ResponseEntity.ok(ApiResponse.success(resp, "Project proposal accepted and converted to Active Project", request.getRequestURI()));
    }

    @PostMapping("/admin/project-requests/{id}/assign-manager")
    public ResponseEntity<ApiResponse<Object>> assignManagerToProject(
            @PathVariable Long id,
            @RequestBody Map<String, Object> body,
            HttpServletRequest request) {

        Long employeeId = Long.valueOf(body.get("employeeId").toString());
        ProjectProposal proposal = projectProposalRepository.findById(id).orElse(null);

        String pCode = "PRJ-2026-00" + id;
        Project project = projectRepository.findByProjectCode(pCode).orElse(null);
        if (project == null && proposal != null) {
            project = projectRepository.findAll().stream()
                    .filter(p -> p.getTitle() != null && p.getTitle().equalsIgnoreCase(proposal.getTitle()))
                    .findFirst().orElse(null);
        }

        if (project != null) {
            Employee manager = employeeRepository.findById(employeeId)
                    .orElseThrow(() -> new RuntimeException("Employee not found: " + employeeId));
            project.setProjectManager(manager);
            projectRepository.save(project);

            if (manager.getUser() != null) {
                Notification notification = Notification.builder()
                        .recipient(manager.getUser())
                        .title("🚀 New Project Manager Assignment")
                        .message("You have been assigned as Program/Project Manager for Project: " + project.getTitle())
                        .linkUrl("/projects")
                        .isRead(false)
                        .build();
                notificationRepository.save(notification);
            }
        }

        return ResponseEntity.ok(ApiResponse.success(Map.of("assigned", true), "Project Manager assigned successfully and notified", request.getRequestURI()));
    }

    @PostMapping("/admin/project-requests/{id}/reject")
    public ResponseEntity<ApiResponse<ProjectProposal>> rejectProjectRequest(@PathVariable Long id, @RequestBody(required = false) Map<String, String> body, HttpServletRequest request) {
        ProjectProposal proposal = projectProposalRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Project proposal not found: " + id));

        proposal.setStatus("REJECTED");
        if (body != null && body.containsKey("reason")) {
            proposal.setRejectionReason(body.get("reason"));
        }
        ProjectProposal updated = projectProposalRepository.save(proposal);

        return ResponseEntity.ok(ApiResponse.success(updated, "Project proposal rejected", request.getRequestURI()));
    }
}
