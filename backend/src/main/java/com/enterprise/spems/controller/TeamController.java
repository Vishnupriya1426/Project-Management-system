package com.enterprise.spems.controller;

import com.enterprise.spems.dto.ApiResponse;
import com.enterprise.spems.model.entity.Employee;
import com.enterprise.spems.model.entity.Project;
import com.enterprise.spems.model.entity.Team;
import com.enterprise.spems.repository.EmployeeRepository;
import com.enterprise.spems.repository.ProjectRepository;
import com.enterprise.spems.repository.TeamRepository;
import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/v1/teams")
@RequiredArgsConstructor
public class TeamController {

    private final TeamRepository teamRepository;
    private final ProjectRepository projectRepository;
    private final EmployeeRepository employeeRepository;

    @GetMapping
    public ResponseEntity<ApiResponse<List<Team>>> getAllTeams(HttpServletRequest request) {
        List<Team> teams = teamRepository.findAll();
        return ResponseEntity.ok(ApiResponse.success(teams, "Teams retrieved successfully", request.getRequestURI()));
    }

    @PostMapping
    public ResponseEntity<ApiResponse<Team>> createTeam(@RequestBody Map<String, Object> payload, HttpServletRequest request) {
        Team team = new Team();
        team.setName((String) payload.getOrDefault("name", "New Squad"));

        if (payload.get("projectId") != null) {
            Long projectId = Long.valueOf(payload.get("projectId").toString());
            projectRepository.findById(projectId).ifPresent(team::setProject);
        }

        if (payload.get("teamLeadId") != null && !payload.get("teamLeadId").toString().isEmpty()) {
            Long teamLeadId = Long.valueOf(payload.get("teamLeadId").toString());
            employeeRepository.findById(teamLeadId).ifPresent(team::setTeamLead);
        }

        if (payload.get("scrumMasterId") != null && !payload.get("scrumMasterId").toString().isEmpty()) {
            Long scrumMasterId = Long.valueOf(payload.get("scrumMasterId").toString());
            employeeRepository.findById(scrumMasterId).ifPresent(team::setScrumMaster);
        }

        if (payload.get("memberIds") instanceof List) {
            List<?> memberIds = (List<?>) payload.get("memberIds");
            team.setMemberCount(Math.max(1, memberIds.size()));
        } else {
            team.setMemberCount(1);
        }

        team.setTargetSize(10);

        if (payload.get("endDate") != null) {
            team.setDeadline(payload.get("endDate").toString());
        }

        if (payload.get("sprintCapacity") != null) {
            try {
                int capacity = Integer.parseInt(payload.get("sprintCapacity").toString());
                int capPercent = Math.min(100, Math.max(50, (capacity * 100) / 100));
                team.setCapacityUtilization(capPercent);
            } catch (Exception ignored) {
                team.setCapacityUtilization(80);
            }
        } else {
            team.setCapacityUtilization(80);
        }

        team.setPrdDocument(team.getName().replaceAll("\\s+", "_") + "_PRD_Spec.pdf");

        Team created = teamRepository.save(team);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success(created, "Team created successfully", request.getRequestURI()));
    }
}
