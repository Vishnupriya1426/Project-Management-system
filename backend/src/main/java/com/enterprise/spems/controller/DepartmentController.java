package com.enterprise.spems.controller;

import com.enterprise.spems.dto.ApiResponse;
import com.enterprise.spems.model.entity.Department;
import com.enterprise.spems.model.entity.Employee;
import com.enterprise.spems.repository.DepartmentRepository;
import com.enterprise.spems.repository.EmployeeRepository;
import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/v1/departments")
@RequiredArgsConstructor
public class DepartmentController {

    private final DepartmentRepository departmentRepository;
    private final EmployeeRepository employeeRepository;

    @GetMapping
    public ResponseEntity<ApiResponse<List<Department>>> getAllDepartments(HttpServletRequest request) {
        List<Department> departments = departmentRepository.findAll();
        return ResponseEntity.ok(ApiResponse.success(departments, "Departments retrieved successfully", request.getRequestURI()));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<Department>> getDepartmentById(@PathVariable Long id, HttpServletRequest request) {
        Department dept = departmentRepository.findById(id).orElse(null);
        if (dept == null) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(ApiResponse.error("Department not found with id " + id, request.getRequestURI()));
        }
        return ResponseEntity.ok(ApiResponse.success(dept, "Department retrieved successfully", request.getRequestURI()));
    }

    @PostMapping
    public ResponseEntity<ApiResponse<Department>> createDepartment(@RequestBody Department department, HttpServletRequest request) {
        if (department.getStatus() == null || department.getStatus().isBlank()) {
            department.setStatus("ACTIVE");
        }
        Department created = departmentRepository.save(department);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success(created, "Department created successfully", request.getRequestURI()));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<Department>> updateDepartment(
            @PathVariable Long id,
            @RequestBody Department updateRequest,
            HttpServletRequest request) {

        Department existing = departmentRepository.findById(id).orElse(null);
        if (existing == null) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(ApiResponse.error("Department not found with id " + id, request.getRequestURI()));
        }

        if (updateRequest.getName() != null) existing.setName(updateRequest.getName());
        if (updateRequest.getCode() != null) existing.setCode(updateRequest.getCode());
        if (updateRequest.getDescription() != null) existing.setDescription(updateRequest.getDescription());
        if (updateRequest.getBudget() != null) existing.setBudget(updateRequest.getBudget());
        if (updateRequest.getLocation() != null) existing.setLocation(updateRequest.getLocation());
        if (updateRequest.getStatus() != null) existing.setStatus(updateRequest.getStatus());
        if (updateRequest.getBusinessUnit() != null) existing.setBusinessUnit(updateRequest.getBusinessUnit());
        if (updateRequest.getHeadOfDepartment() != null) existing.setHeadOfDepartment(updateRequest.getHeadOfDepartment());

        Department saved = departmentRepository.save(existing);
        return ResponseEntity.ok(ApiResponse.success(saved, "Department updated successfully in MySQL", request.getRequestURI()));
    }

    @PostMapping("/{id}/assign-head")
    public ResponseEntity<ApiResponse<Department>> assignDepartmentHead(
            @PathVariable Long id,
            @RequestBody Map<String, Object> body,
            HttpServletRequest request) {

        Department existing = departmentRepository.findById(id).orElse(null);
        if (existing == null) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(ApiResponse.error("Department not found", request.getRequestURI()));
        }

        if (body.containsKey("employeeId") && body.get("employeeId") != null) {
            Long empId = Long.valueOf(body.get("employeeId").toString());
            Employee emp = employeeRepository.findById(empId).orElse(null);
            if (emp != null) {
                // 1. Link Department HOD
                existing.setHeadOfDepartment(emp);

                // 2. Enterprise Auto-Cascade: Update Employee Department & Designation
                emp.setDepartment(existing);
                emp.setDesignation("Head of " + existing.getName());
                employeeRepository.save(emp);
            }
        }

        Department saved = departmentRepository.save(existing);
        return ResponseEntity.ok(ApiResponse.success(saved, "Department Head assigned successfully. Employee profile, department & org chart updated across enterprise!", request.getRequestURI()));
    }

    @PostMapping("/{id}/archive")
    public ResponseEntity<ApiResponse<Department>> archiveDepartment(@PathVariable Long id, HttpServletRequest request) {
        Department existing = departmentRepository.findById(id).orElse(null);
        if (existing == null) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(ApiResponse.error("Department not found", request.getRequestURI()));
        }

        existing.setStatus("ARCHIVED");
        Department saved = departmentRepository.save(existing);
        return ResponseEntity.ok(ApiResponse.success(saved, "Department archived successfully. No new employees or projects allowed.", request.getRequestURI()));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Object>> deleteDepartment(@PathVariable Long id, HttpServletRequest request) {
        Department existing = departmentRepository.findById(id).orElse(null);
        if (existing == null) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(ApiResponse.error("Department not found", request.getRequestURI()));
        }

        // Enterprise Protection Validation: Do not allow deletion if active employees exist
        long empCount = employeeRepository.countByDepartmentId(id);
        if (empCount > 0) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(ApiResponse.error(
                            "Cannot delete Department '" + existing.getName() + "': " + empCount + " active employee(s) are currently assigned. Reassign employees before deletion.",
                            request.getRequestURI()
                    ));
        }

        departmentRepository.delete(existing);
        return ResponseEntity.ok(ApiResponse.success(null, "Department '" + existing.getName() + "' deleted successfully from database.", request.getRequestURI()));
    }
}
