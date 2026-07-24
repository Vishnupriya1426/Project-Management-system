package com.enterprise.spems.controller;

import com.enterprise.spems.dto.ApiResponse;
import com.enterprise.spems.model.entity.*;
import com.enterprise.spems.repository.*;
import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.*;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/v1/meetings")
@RequiredArgsConstructor
public class MeetingController {

    private final MeetingRepository meetingRepository;
    private final ProjectRepository projectRepository;
    private final TeamRepository teamRepository;
    private final ClientRepository clientRepository;
    private final EmployeeRepository employeeRepository;
    private final NotificationRepository notificationRepository;

    @GetMapping
    public ResponseEntity<ApiResponse<List<Map<String, Object>>>> getAllMeetings(
            @RequestParam(required = false) Long projectId,
            @RequestParam(required = false) Long teamId,
            @RequestParam(required = false) Long clientId,
            @RequestParam(required = false) String scope,
            HttpServletRequest request) {

        List<Meeting> list;
        if (projectId != null) {
            list = meetingRepository.findByProjectId(projectId);
        } else if (clientId != null) {
            list = meetingRepository.findByClientId(clientId);
        } else if (teamId != null) {
            list = meetingRepository.findByTeamId(teamId);
        } else if (scope != null) {
            list = meetingRepository.findByVisibilityScope(scope);
        } else {
            list = meetingRepository.findAll();
        }

        List<Map<String, Object>> result = list.stream().map(this::mapToDTO).collect(Collectors.toList());
        return ResponseEntity.ok(ApiResponse.success(result, "Meetings retrieved successfully", request.getRequestURI()));
    }

    @GetMapping("/client/{clientId}")
    public ResponseEntity<ApiResponse<List<Map<String, Object>>>> getClientMeetings(
            @PathVariable Long clientId, HttpServletRequest request) {
        List<Meeting> list = meetingRepository.findByClientId(clientId);
        List<Map<String, Object>> result = list.stream().map(this::mapToDTO).collect(Collectors.toList());
        return ResponseEntity.ok(ApiResponse.success(result, "Client meetings retrieved successfully", request.getRequestURI()));
    }

    @GetMapping("/project/{projectId}")
    public ResponseEntity<ApiResponse<List<Map<String, Object>>>> getProjectMeetings(
            @PathVariable Long projectId, HttpServletRequest request) {
        List<Meeting> list = meetingRepository.findByProjectId(projectId);
        List<Map<String, Object>> result = list.stream().map(this::mapToDTO).collect(Collectors.toList());
        return ResponseEntity.ok(ApiResponse.success(result, "Project meetings retrieved successfully", request.getRequestURI()));
    }

    @PostMapping
    public ResponseEntity<ApiResponse<Map<String, Object>>> createMeeting(
            @RequestBody Map<String, Object> payload, HttpServletRequest request) {

        String title = (String) payload.getOrDefault("title", "Enterprise Alignment Meeting");
        String meetingType = (String) payload.getOrDefault("meetingType", "Sprint Planning");
        String visibilityScope = (String) payload.getOrDefault("visibilityScope", "PROJECT_TEAM");
        String targetRole = (String) payload.getOrDefault("targetRole", "");
        String meetingDate = (String) payload.getOrDefault("meetingDate", "2026-07-25");
        String startTime = (String) payload.getOrDefault("startTime", "10:00");
        String endTime = (String) payload.getOrDefault("endTime", "11:00");
        Integer durationMinutes = payload.get("durationMinutes") != null ? Integer.valueOf(payload.get("durationMinutes").toString()) : 60;
        String meetingLink = (String) payload.getOrDefault("meetingUrl", (String) payload.getOrDefault("meetingLink", "https://meet.google.com/spems-sync"));
        String locationType = (String) payload.getOrDefault("locationType", "Online");
        String buildingRoom = (String) payload.getOrDefault("buildingRoom", "");
        String agenda = (String) payload.getOrDefault("agenda", "");
        String status = (String) payload.getOrDefault("status", "SCHEDULED");

        Long projectId = payload.get("projectId") != null ? Long.valueOf(payload.get("projectId").toString()) : null;
        Long teamId = payload.get("teamId") != null ? Long.valueOf(payload.get("teamId").toString()) : null;
        Long clientId = payload.get("clientId") != null ? Long.valueOf(payload.get("clientId").toString()) : null;

        Meeting m = new Meeting();
        m.setTitle(title);
        m.setMeetingType(meetingType);
        m.setVisibilityScope(visibilityScope);
        m.setTargetRole(targetRole);
        m.setMeetingDate(meetingDate);
        m.setStartTime(startTime);
        m.setEndTime(endTime);
        m.setDurationMinutes(durationMinutes);
        m.setMeetingLink(meetingLink);
        m.setLocationType(locationType);
        m.setBuildingRoom(buildingRoom);
        m.setAgenda(agenda);
        m.setStatus(status);

        if (projectId != null) projectRepository.findById(projectId).ifPresent(m::setProject);
        if (teamId != null) teamRepository.findById(teamId).ifPresent(m::setTeam);
        if (clientId != null) clientRepository.findById(clientId).ifPresent(m::setClient);

        Meeting saved = meetingRepository.save(m);

        // Safe Automated Notifications Dispatch
        try {
            List<?> participantIdsRaw = (List<?>) payload.get("participantIds");
            if (participantIdsRaw != null) {
                for (Object pId : participantIdsRaw) {
                    if (pId != null) {
                        Long empId = Long.valueOf(pId.toString());
                        employeeRepository.findById(empId).ifPresent(emp -> {
                            if (emp.getUser() != null) {
                                try {
                                    Notification notif = Notification.builder()
                                            .recipient(emp.getUser())
                                            .title("Meeting Invitation: " + saved.getTitle())
                                            .message("You have been invited to '" + saved.getTitle() + "' (" + saved.getMeetingType() + ") scheduled on " + saved.getMeetingDate() + " at " + saved.getStartTime())
                                            .linkUrl("/meetings")
                                            .isRead(false)
                                            .build();
                                    notificationRepository.save(notif);
                                } catch (Exception ignored) {}
                            }
                        });
                    }
                }
            }
        } catch (Exception ignored) {}

        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success(mapToDTO(saved), "Meeting scheduled successfully", request.getRequestURI()));
    }

    private Map<String, Object> mapToDTO(Meeting m) {
        Map<String, Object> map = new HashMap<>();
        map.put("id", m.getId());
        map.put("title", m.getTitle());
        map.put("meetingType", m.getMeetingType() != null ? m.getMeetingType() : "General Sync");
        map.put("visibilityScope", m.getVisibilityScope() != null ? m.getVisibilityScope() : "PROJECT_TEAM");
        map.put("targetRole", m.getTargetRole() != null ? m.getTargetRole() : "");
        map.put("meetingDate", m.getMeetingDate() != null ? m.getMeetingDate() : "");
        map.put("startTime", m.getStartTime() != null ? m.getStartTime() : "");
        map.put("endTime", m.getEndTime() != null ? m.getEndTime() : "");
        map.put("durationMinutes", m.getDurationMinutes() != null ? m.getDurationMinutes() : 60);
        map.put("meetingUrl", m.getMeetingLink() != null ? m.getMeetingLink() : "https://meet.google.com/spems-sync");
        map.put("locationType", m.getLocationType() != null ? m.getLocationType() : "Online");
        map.put("buildingRoom", m.getBuildingRoom() != null ? m.getBuildingRoom() : "");
        map.put("agenda", m.getAgenda() != null ? m.getAgenda() : "");
        map.put("status", m.getStatus() != null ? m.getStatus() : "SCHEDULED");

        if (m.getProject() != null) {
            map.put("projectId", m.getProject().getId());
            map.put("projectName", m.getProject().getTitle());
        } else {
            map.put("projectName", "Enterprise System");
        }

        if (m.getTeam() != null) {
            map.put("teamId", m.getTeam().getId());
            map.put("teamName", m.getTeam().getName());
        } else {
            map.put("teamName", "All Pods");
        }

        if (m.getClient() != null) {
            map.put("clientId", m.getClient().getId());
            map.put("clientName", m.getClient().getCompanyName());
        }

        return map;
    }
}
