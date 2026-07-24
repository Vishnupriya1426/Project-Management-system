package com.enterprise.spems.controller;

import com.enterprise.spems.dto.ApiResponse;
import com.enterprise.spems.model.entity.*;
import com.enterprise.spems.repository.*;
import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/v1/tasks")
@RequiredArgsConstructor
public class TaskController {

    private final TaskRepository taskRepository;
    private final ProjectRepository projectRepository;
    private final TeamRepository teamRepository;
    private final SprintRepository sprintRepository;
    private final DepartmentRepository departmentRepository;
    private final EmployeeRepository employeeRepository;
    private final NotificationRepository notificationRepository;
    private final AuditLogRepository auditLogRepository;

    @GetMapping
    public ResponseEntity<ApiResponse<List<Task>>> getAllTasks(
            @RequestParam(required = false) Long projectId,
            @RequestParam(required = false) Long teamId,
            @RequestParam(required = false) Long sprintId,
            @RequestParam(required = false) Long departmentId,
            @RequestParam(required = false) Long assigneeId,
            @RequestParam(required = false) String status,
            HttpServletRequest request) {

        List<Task> tasks = taskRepository.findAll();

        if (projectId != null) {
            tasks = tasks.stream().filter(t -> t.getProject() != null && t.getProject().getId().equals(projectId)).collect(Collectors.toList());
        }
        if (teamId != null) {
            tasks = tasks.stream().filter(t -> t.getTeam() != null && t.getTeam().getId().equals(teamId)).collect(Collectors.toList());
        }
        if (sprintId != null) {
            tasks = tasks.stream().filter(t -> t.getSprint() != null && t.getSprint().getId().equals(sprintId)).collect(Collectors.toList());
        }
        if (departmentId != null) {
            tasks = tasks.stream().filter(t -> t.getDepartment() != null && t.getDepartment().getId().equals(departmentId)).collect(Collectors.toList());
        }
        if (assigneeId != null) {
            tasks = tasks.stream().filter(t -> t.getAssignee() != null && t.getAssignee().getId().equals(assigneeId)).collect(Collectors.toList());
        }
        if (status != null && !status.isEmpty() && !"ALL".equalsIgnoreCase(status)) {
            tasks = tasks.stream().filter(t -> status.equalsIgnoreCase(t.getStatus())).collect(Collectors.toList());
        }

        return ResponseEntity.ok(ApiResponse.success(tasks, "Tasks retrieved successfully", request.getRequestURI()));
    }

    @PostMapping
    public ResponseEntity<ApiResponse<Task>> createTask(
            @RequestBody Map<String, Object> payload,
            HttpServletRequest request) {

        if (payload.get("title") == null) {
            return ResponseEntity.badRequest().body(ApiResponse.error("Task title is required", request.getRequestURI()));
        }

        String title = (String) payload.get("title");
        String description = (String) payload.getOrDefault("description", "");
        String priority = (String) payload.getOrDefault("priority", "MEDIUM");
        String status = (String) payload.getOrDefault("status", "TODO");
        String dueDate = (String) payload.getOrDefault("dueDate", "2026-08-15");
        Double estimatedHours = payload.get("estimatedHours") != null ? Double.valueOf(payload.get("estimatedHours").toString()) : 8.0;
        Integer storyPoints = payload.get("storyPoints") != null ? Integer.valueOf(payload.get("storyPoints").toString()) : 5;

        Task task = new Task();
        task.setTitle(title);
        task.setDescription(description);
        task.setPriority(priority);
        task.setStatus(status);
        task.setDueDate(dueDate);
        task.setEstimatedHours(estimatedHours);
        task.setStoryPoints(storyPoints);
        task.setProgressPercentage(0);

        if (payload.get("projectId") != null && !payload.get("projectId").toString().isEmpty()) {
            Long projectId = Long.valueOf(payload.get("projectId").toString());
            projectRepository.findById(projectId).ifPresent(task::setProject);
        }

        if (payload.get("teamId") != null && !payload.get("teamId").toString().isEmpty()) {
            Long teamId = Long.valueOf(payload.get("teamId").toString());
            teamRepository.findById(teamId).ifPresent(task::setTeam);
        }

        if (payload.get("sprintId") != null && !payload.get("sprintId").toString().isEmpty()) {
            Long sprintId = Long.valueOf(payload.get("sprintId").toString());
            sprintRepository.findById(sprintId).ifPresent(task::setSprint);
        }

        if (payload.get("departmentId") != null && !payload.get("departmentId").toString().isEmpty()) {
            Long departmentId = Long.valueOf(payload.get("departmentId").toString());
            departmentRepository.findById(departmentId).ifPresent(task::setDepartment);
        }

        if (payload.get("assigneeId") != null && !payload.get("assigneeId").toString().isEmpty()) {
            Long assigneeId = Long.valueOf(payload.get("assigneeId").toString());
            employeeRepository.findById(assigneeId).ifPresent(emp -> {
                task.setAssignee(emp);
                if (emp.getUser() != null) {
                    notificationRepository.save(Notification.builder()
                            .recipient(emp.getUser())
                            .title("New Task Assigned: " + task.getTitle())
                            .message("You have been assigned task '" + task.getTitle() + "' due on " + task.getDueDate())
                            .linkUrl("/tasks")
                            .isRead(false)
                            .build());
                }
            });
        }

        Task saved = taskRepository.save(task);
        saved.setTaskCode("TSK-2026-" + (1000 + saved.getId()));
        Task updatedWithCode = taskRepository.save(saved);

        // Audit Log
        AuditLog audit = AuditLog.builder()
                .action("TASK_CREATED")
                .entityName("Task")
                .entityId(updatedWithCode.getId())
                .details("Created Task '" + updatedWithCode.getTaskCode() + "': " + updatedWithCode.getTitle())
                .ipAddress(request.getRemoteAddr())
                .build();
        auditLogRepository.save(audit);

        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success(updatedWithCode, "Task created successfully", request.getRequestURI()));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<Task>> updateTask(
            @PathVariable Long id,
            @RequestBody Map<String, Object> payload,
            HttpServletRequest request) {

        return taskRepository.findById(id)
                .map(task -> {
                    if (payload.containsKey("title")) task.setTitle((String) payload.get("title"));
                    if (payload.containsKey("description")) task.setDescription((String) payload.get("description"));
                    if (payload.containsKey("priority")) task.setPriority((String) payload.get("priority"));
                    if (payload.containsKey("status")) {
                        String st = (String) payload.get("status");
                        task.setStatus(st);
                        if ("COMPLETED".equalsIgnoreCase(st)) task.setProgressPercentage(100);
                    }
                    if (payload.containsKey("progressPercentage")) {
                        int pct = Integer.parseInt(payload.get("progressPercentage").toString());
                        task.setProgressPercentage(Math.min(100, Math.max(0, pct)));
                        if (pct >= 100) task.setStatus("COMPLETED");
                    }
                    if (payload.containsKey("actualHours")) {
                        task.setActualHours(Double.valueOf(payload.get("actualHours").toString()));
                    }

                    if (payload.containsKey("assigneeId") && payload.get("assigneeId") != null) {
                        Long aId = Long.valueOf(payload.get("assigneeId").toString());
                        employeeRepository.findById(aId).ifPresent(task::setAssignee);
                    }

                    Task saved = taskRepository.save(task);
                    return ResponseEntity.ok(ApiResponse.success(saved, "Task updated successfully", request.getRequestURI()));
                })
                .orElseGet(() -> ResponseEntity.notFound().build());
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> deleteTask(@PathVariable Long id, HttpServletRequest request) {
        if (taskRepository.existsById(id)) {
            taskRepository.deleteById(id);
            return ResponseEntity.ok(ApiResponse.success(null, "Task deleted successfully", request.getRequestURI()));
        }
        return ResponseEntity.notFound().build();
    }
}
