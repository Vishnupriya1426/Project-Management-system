package com.enterprise.spems.controller;

import com.enterprise.spems.dto.ApiResponse;
import com.enterprise.spems.model.entity.Employee;
import com.enterprise.spems.model.entity.Team;
import com.enterprise.spems.repository.EmployeeRepository;
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
    private final EmployeeRepository employeeRepository;

    @GetMapping
    public ResponseEntity<ApiResponse<List<Team>>> getAllTeams(HttpServletRequest request) {
        List<Team> teams = teamRepository.findAll();
        return ResponseEntity.ok(ApiResponse.success(teams, "Teams retrieved successfully", request.getRequestURI()));
    }

    @PostMapping
    public ResponseEntity<ApiResponse<Team>> createTeam(@RequestBody Map<String, Object> payload, HttpServletRequest request) {
        String name = (String) payload.getOrDefault("name", "New Delivery Squad");
        
        Team team = new Team();
        team.setName(name);

        if (payload.get("teamLeadId") != null) {
            Long teamLeadId = Long.valueOf(payload.get("teamLeadId").toString());
            employeeRepository.findById(teamLeadId).ifPresent(team::setTeamLead);
        }

        Team created = teamRepository.save(team);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success(created, "Team created successfully", request.getRequestURI()));
    }
}
