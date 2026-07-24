package com.enterprise.spems.controller;

import com.enterprise.spems.dto.ApiResponse;
import com.enterprise.spems.model.entity.AuditLog;
import com.enterprise.spems.model.entity.Project;
import com.enterprise.spems.model.entity.Sprint;
import com.enterprise.spems.model.entity.Team;
import com.enterprise.spems.repository.AuditLogRepository;
import com.enterprise.spems.repository.ProjectRepository;
import com.enterprise.spems.repository.SprintRepository;
import com.enterprise.spems.repository.TeamRepository;
import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/v1/sprints")
@RequiredArgsConstructor
public class SprintController {

    private final SprintRepository sprintRepository;
    private final ProjectRepository projectRepository;
    private final TeamRepository teamRepository;
    private final AuditLogRepository auditLogRepository;

    @GetMapping
    public ResponseEntity<ApiResponse<List<Sprint>>> getAllSprints(
            @RequestParam(required = false) Long projectId,
            @RequestParam(required = false) Long teamId,
            HttpServletRequest request) {

        List<Sprint> list;
        if (projectId != null) {
            list = sprintRepository.findByProjectId(projectId);
        } else if (teamId != null) {
            list = sprintRepository.findByTeamId(teamId);
        } else {
            list = sprintRepository.findAll();
        }

        return ResponseEntity.ok(ApiResponse.success(list, "Sprints retrieved successfully", request.getRequestURI()));
    }

    @PostMapping
    public ResponseEntity<ApiResponse<Sprint>> createSprint(
            @RequestBody Map<String, Object> payload,
            HttpServletRequest request) {

        if (payload.get("sprintName") == null || payload.get("projectId") == null) {
            return ResponseEntity.badRequest().body(ApiResponse.error("sprintName and projectId are required", request.getRequestURI()));
        }

        String sprintName = (String) payload.get("sprintName");
        Long projectId = Long.valueOf(payload.get("projectId").toString());

        Project project = projectRepository.findById(projectId).orElse(null);
        if (project == null) {
            return ResponseEntity.badRequest().body(ApiResponse.error("Project not found", request.getRequestURI()));
        }

        Team team = null;
        if (payload.get("teamId") != null && !payload.get("teamId").toString().isEmpty()) {
            Long teamId = Long.valueOf(payload.get("teamId").toString());
            team = teamRepository.findById(teamId).orElse(null);
        }

        String startDate = (String) payload.getOrDefault("startDate", "2026-07-25");
        String endDate = (String) payload.getOrDefault("endDate", "2026-08-08");
        String goal = (String) payload.getOrDefault("goal", "");
        Integer capacityHours = payload.get("capacityHours") != null ? Integer.valueOf(payload.get("capacityHours").toString()) : 80;
        Integer storyPoints = payload.get("storyPoints") != null ? Integer.valueOf(payload.get("storyPoints").toString()) : 40;

        Sprint sprint = Sprint.builder()
                .sprintName(sprintName)
                .project(project)
                .team(team)
                .startDate(startDate)
                .endDate(endDate)
                .goal(goal)
                .capacityHours(capacityHours)
                .storyPoints(storyPoints)
                .completedPoints(0)
                .status("PLANNING")
                .build();

        Sprint saved = sprintRepository.save(sprint);

        // Create Audit Log
        AuditLog audit = AuditLog.builder()
                .action("SPRINT_CREATED")
                .entityName("Sprint")
                .entityId(saved.getId())
                .details("Created Sprint '" + saved.getSprintName() + "' for project " + project.getTitle())
                .ipAddress(request.getRemoteAddr())
                .build();
        auditLogRepository.save(audit);

        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success(saved, "Sprint created successfully", request.getRequestURI()));
    }

    @PutMapping("/{id}/status")
    public ResponseEntity<ApiResponse<Sprint>> updateSprintStatus(
            @PathVariable Long id,
            @RequestBody Map<String, Object> payload,
            HttpServletRequest request) {

        return sprintRepository.findById(id)
                .map(sprint -> {
                    if (payload.containsKey("status")) {
                        sprint.setStatus(payload.get("status").toString());
                    }

                    if (payload.containsKey("completedPoints")) {
                        int pts = Integer.parseInt(payload.get("completedPoints").toString());
                        sprint.setCompletedPoints(Math.min(pts, sprint.getStoryPoints()));
                    }

                    Sprint updated = sprintRepository.save(sprint);

                    return ResponseEntity.ok(ApiResponse.success(updated, "Sprint status updated successfully", request.getRequestURI()));
                })
                .orElseGet(() -> ResponseEntity.notFound().build());
    }
}
