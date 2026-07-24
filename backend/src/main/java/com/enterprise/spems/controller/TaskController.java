package com.enterprise.spems.controller;

import com.enterprise.spems.dto.ApiResponse;
import com.enterprise.spems.model.entity.Task;
import com.enterprise.spems.repository.TaskRepository;
import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/tasks")
@RequiredArgsConstructor
public class TaskController {

    private final TaskRepository taskRepository;

    @GetMapping
    public ResponseEntity<ApiResponse<List<Task>>> getAllTasks(
            @RequestParam(required = false) Long projectId,
            HttpServletRequest request) {
        List<Task> tasks = (projectId != null) ? taskRepository.findByProjectId(projectId) : taskRepository.findAll();
        return ResponseEntity.ok(ApiResponse.success(tasks, "Tasks retrieved successfully", request.getRequestURI()));
    }

    @PostMapping
    public ResponseEntity<ApiResponse<Task>> createTask(@RequestBody Task task, HttpServletRequest request) {
        Task created = taskRepository.save(task);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success(created, "Task created successfully", request.getRequestURI()));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<Task>> updateTask(@PathVariable Long id, @RequestBody Task taskDetails, HttpServletRequest request) {
        return taskRepository.findById(id)
                .map(existingTask -> {
                    if (taskDetails.getStatus() != null) existingTask.setStatus(taskDetails.getStatus());
                    if (taskDetails.getTitle() != null) existingTask.setTitle(taskDetails.getTitle());
                    if (taskDetails.getPriority() != null) existingTask.setPriority(taskDetails.getPriority());
                    Task updated = taskRepository.save(existingTask);
                    return ResponseEntity.ok(ApiResponse.success(updated, "Task updated successfully", request.getRequestURI()));
                })
                .orElseGet(() -> ResponseEntity.notFound().build());
    }
}
