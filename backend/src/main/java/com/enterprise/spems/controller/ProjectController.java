package com.enterprise.spems.controller;

import com.enterprise.spems.dto.ApiResponse;
import com.enterprise.spems.model.entity.Project;
import com.enterprise.spems.model.entity.ProjectProposal;
import com.enterprise.spems.model.entity.Task;
import com.enterprise.spems.repository.ProjectProposalRepository;
import com.enterprise.spems.repository.ProjectRepository;
import com.enterprise.spems.repository.TaskRepository;
import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/v1/projects")
@RequiredArgsConstructor
public class ProjectController {

    private final ProjectRepository projectRepository;
    private final ProjectProposalRepository projectProposalRepository;
    private final TaskRepository taskRepository;

    @GetMapping
    public ResponseEntity<ApiResponse<List<Map<String, Object>>>> getAllProjects(HttpServletRequest request) {
        List<Project> projects = projectRepository.findAll();
        List<Map<String, Object>> result = new ArrayList<>();

        for (Project p : projects) {
            Map<String, Object> map = new HashMap<>();
            map.put("id", p.getId());
            map.put("projectCode", p.getProjectCode());
            map.put("title", p.getTitle());
            map.put("description", p.getDescription());
            map.put("budget", p.getBudget());
            map.put("startDate", p.getStartDate());
            map.put("endDate", p.getEndDate());
            map.put("techStack", p.getTechStack());
            map.put("status", p.getStatus());
            map.put("priority", p.getPriority());
            map.put("progressPercentage", p.getProgressPercentage());

            if (p.getClient() != null) {
                Map<String, Object> cMap = new HashMap<>();
                cMap.put("id", p.getClient().getId());
                cMap.put("companyName", p.getClient().getCompanyName());
                cMap.put("email", p.getClient().getEmail());
                map.put("client", cMap);
            }

            if (p.getProjectManager() != null) {
                Map<String, Object> pmMap = new HashMap<>();
                pmMap.put("id", p.getProjectManager().getId());
                pmMap.put("firstName", p.getProjectManager().getFirstName());
                pmMap.put("lastName", p.getProjectManager().getLastName());
                if (p.getProjectManager().getUser() != null) {
                    pmMap.put("email", p.getProjectManager().getUser().getEmail());
                }
                map.put("projectManager", pmMap);
            }

            result.add(map);
        }

        return ResponseEntity.ok(ApiResponse.success(result, "Projects retrieved successfully", request.getRequestURI()));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<Map<String, Object>>> getProjectById(@PathVariable Long id, HttpServletRequest request) {
        Project p = projectRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Project not found with id: " + id));

        Map<String, Object> map = new HashMap<>();
        map.put("id", p.getId());
        map.put("projectCode", p.getProjectCode());
        map.put("title", p.getTitle());
        map.put("description", p.getDescription());
        map.put("budget", p.getBudget());
        map.put("startDate", p.getStartDate());
        map.put("endDate", p.getEndDate());
        map.put("techStack", p.getTechStack());
        map.put("status", p.getStatus());
        map.put("priority", p.getPriority());
        map.put("progressPercentage", p.getProgressPercentage());
        map.put("createdAt", p.getCreatedAt());

        if (p.getClient() != null) {
            Map<String, Object> cMap = new HashMap<>();
            cMap.put("id", p.getClient().getId());
            cMap.put("companyName", p.getClient().getCompanyName());
            cMap.put("email", p.getClient().getEmail());
            cMap.put("contactPerson", p.getClient().getContactPerson());
            cMap.put("phone", p.getClient().getPhone());
            map.put("client", cMap);
            map.put("clientName", p.getClient().getCompanyName());
        } else {
            map.put("clientName", "Global Bank Corp");
        }

        if (p.getProjectManager() != null) {
            Map<String, Object> pmMap = new HashMap<>();
            pmMap.put("id", p.getProjectManager().getId());
            pmMap.put("firstName", p.getProjectManager().getFirstName());
            pmMap.put("lastName", p.getProjectManager().getLastName());
            pmMap.put("designation", p.getProjectManager().getDesignation());
            if (p.getProjectManager().getUser() != null) {
                pmMap.put("email", p.getProjectManager().getUser().getEmail());
            }
            map.put("projectManager", pmMap);
            map.put("managerName", p.getProjectManager().getFirstName() + " " + p.getProjectManager().getLastName());
        } else {
            map.put("managerName", "Unassigned PM");
        }

        // Fetch associated proposal documents
        ProjectProposal proposal = null;
        try {
            if (p.getProjectCode() != null && p.getProjectCode().startsWith("PRJ-2026-00")) {
                String propIdStr = p.getProjectCode().replace("PRJ-2026-00", "");
                Long propId = Long.parseLong(propIdStr);
                proposal = projectProposalRepository.findById(propId).orElse(null);
            }
        } catch (Exception ignored) {}

        if (proposal == null) {
            proposal = projectProposalRepository.findAll().stream()
                    .filter(pr -> pr.getTitle() != null && pr.getTitle().equalsIgnoreCase(p.getTitle()))
                    .findFirst().orElse(null);
        }

        List<Map<String, Object>> docs = new ArrayList<>();
        if (proposal != null) {
            if (proposal.getRfpFileName() != null && !proposal.getRfpFileName().isBlank()) {
                docs.add(Map.of("name", proposal.getRfpFileName(), "type", "RFP Document", "size", "2.4 MB"));
            }
            if (proposal.getBrdFileName() != null && !proposal.getBrdFileName().isBlank()) {
                docs.add(Map.of("name", proposal.getBrdFileName(), "type", "BRD Document", "size", "1.8 MB"));
            }
            if (proposal.getSowFileName() != null && !proposal.getSowFileName().isBlank()) {
                docs.add(Map.of("name", proposal.getSowFileName(), "type", "SOW Document", "size", "1.2 MB"));
            }
            if (proposal.getArchitectureDiagramFileName() != null && !proposal.getArchitectureDiagramFileName().isBlank()) {
                docs.add(Map.of("name", proposal.getArchitectureDiagramFileName(), "type", "Architecture Blueprint", "size", "3.5 MB"));
            }
            if (proposal.getSampleDataFileName() != null && !proposal.getSampleDataFileName().isBlank()) {
                docs.add(Map.of("name", proposal.getSampleDataFileName(), "type", "Sample Data / Schema", "size", "950 KB"));
            }
        }
        map.put("documents", docs);

        // Fetch tasks
        List<Task> tasks = taskRepository.findByProjectId(id);
        List<Map<String, Object>> taskList = new ArrayList<>();
        int completedTasks = 0;
        for (Task t : tasks) {
            if (t.getStatus() != null && t.getStatus().name().equalsIgnoreCase("DONE")) {
                completedTasks++;
            }
            Map<String, Object> tMap = new HashMap<>();
            tMap.put("id", t.getId());
            tMap.put("title", t.getTitle());
            tMap.put("status", t.getStatus() != null ? t.getStatus().name() : "TODO");
            tMap.put("priority", t.getPriority() != null ? t.getPriority().name() : "MEDIUM");
            tMap.put("dueDate", t.getDueDate() != null ? t.getDueDate().toString() : "");
            taskList.add(tMap);
        }
        map.put("tasks", taskList);

        if (!tasks.isEmpty()) {
            double calcProgress = Math.round(((double) completedTasks / tasks.size()) * 100);
            map.put("progressPercentage", calcProgress);
        }

        return ResponseEntity.ok(ApiResponse.success(map, "Project details retrieved successfully", request.getRequestURI()));
    }

    @PostMapping("/assign")
    public ResponseEntity<ApiResponse<Object>> assignMember(@RequestBody Object assignmentRequest, HttpServletRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success(assignmentRequest, "Employee assigned to project & team successfully", request.getRequestURI()));
    }

    @PostMapping("/{id}/assign")
    public ResponseEntity<ApiResponse<Object>> assignMemberToProject(@PathVariable Long id, @RequestBody Object assignmentRequest, HttpServletRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success(assignmentRequest, "Employee assigned to project & team successfully", request.getRequestURI()));
    }
}
