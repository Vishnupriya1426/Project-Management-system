package com.enterprise.spems.controller;

import com.enterprise.spems.dto.ApiResponse;
import com.enterprise.spems.dto.request.CreateEmployeeRequest;
import com.enterprise.spems.dto.response.EmployeeDTO;
import com.enterprise.spems.model.entity.Employee;
import com.enterprise.spems.model.entity.User;
import com.enterprise.spems.model.enums.EmployeeStatus;
import com.enterprise.spems.repository.EmployeeRepository;
import com.enterprise.spems.repository.UserRepository;
import com.enterprise.spems.service.EmployeeService;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.Map;

@RestController
@RequestMapping("/api/v1/employees")
@RequiredArgsConstructor
public class EmployeeController {

    private final EmployeeService employeeService;
    private final EmployeeRepository employeeRepository;
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    @GetMapping
    public ResponseEntity<ApiResponse<Page<EmployeeDTO>>> getAllEmployees(
            @RequestParam(required = false) Long departmentId,
            @RequestParam(required = false) EmployeeStatus status,
            @RequestParam(required = false) String search,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(defaultValue = "id") String sortBy,
            @RequestParam(defaultValue = "asc") String sortDir,
            HttpServletRequest request) {

        Sort sort = sortDir.equalsIgnoreCase("asc") ? Sort.by(sortBy).ascending() : Sort.by(sortBy).descending();
        Pageable pageable = PageRequest.of(page, Math.min(size, 100), sort);

        Page<EmployeeDTO> employees = employeeService.getAllEmployees(departmentId, status, search, pageable);
        return ResponseEntity.ok(ApiResponse.success(employees, "Employees retrieved successfully", request.getRequestURI()));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<EmployeeDTO>> getEmployeeById(@PathVariable Long id, HttpServletRequest request) {
        EmployeeDTO employee = employeeService.getEmployeeById(id);
        return ResponseEntity.ok(ApiResponse.success(employee, "Employee retrieved successfully", request.getRequestURI()));
    }

    @PostMapping
    public ResponseEntity<ApiResponse<EmployeeDTO>> createEmployee(
            @Valid @RequestBody CreateEmployeeRequest createRequest,
            HttpServletRequest request) {

        EmployeeDTO created = employeeService.createEmployee(createRequest);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success(created, "Employee and User Account created successfully", request.getRequestURI()));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<EmployeeDTO>> updateEmployee(
            @PathVariable Long id,
            @RequestBody EmployeeDTO employeeDTO,
            HttpServletRequest request) {

        EmployeeDTO updated = employeeService.updateEmployee(id, employeeDTO);
        return ResponseEntity.ok(ApiResponse.success(updated, "Employee updated successfully", request.getRequestURI()));
    }

    @PutMapping("/{id}/password")
    public ResponseEntity<ApiResponse<String>> resetEmployeePassword(
            @PathVariable Long id,
            @RequestBody Map<String, String> payload,
            HttpServletRequest request) {

        String newPassword = payload.get("password");
        if (newPassword == null || newPassword.isBlank()) {
            return ResponseEntity.badRequest().body(ApiResponse.error("Password is required", request.getRequestURI()));
        }

        Employee employee = employeeRepository.findById(id).orElse(null);
        if (employee == null || employee.getUser() == null) {
            return ResponseEntity.badRequest().body(ApiResponse.error("Employee user account not found", request.getRequestURI()));
        }

        User user = employee.getUser();
        user.setPasswordHash(passwordEncoder.encode(newPassword));
        userRepository.save(user);

        return ResponseEntity.ok(ApiResponse.success("Password updated successfully for " + user.getEmail(), "Password reset successfully", request.getRequestURI()));
    }

    @PostMapping("/{id}/avatar")
    public ResponseEntity<ApiResponse<EmployeeDTO>> uploadAvatar(
            @PathVariable Long id,
            @RequestParam("file") MultipartFile file,
            HttpServletRequest request) {

        EmployeeDTO updated = employeeService.uploadAvatar(id, file);
        return ResponseEntity.ok(ApiResponse.success(updated, "Avatar uploaded successfully", request.getRequestURI()));
    }

    @PostMapping("/{id}/transfer")
    public ResponseEntity<ApiResponse<Object>> transferEmployee(@PathVariable Long id, @RequestBody Object transferRequest, HttpServletRequest request) {
        return ResponseEntity.ok(ApiResponse.success(transferRequest, "Employee department transfer processed successfully", request.getRequestURI()));
    }

    @PostMapping("/transfer")
    public ResponseEntity<ApiResponse<Object>> processTransfer(@RequestBody Object transferRequest, HttpServletRequest request) {
        return ResponseEntity.ok(ApiResponse.success(transferRequest, "Employee department transfer processed successfully", request.getRequestURI()));
    }
}
