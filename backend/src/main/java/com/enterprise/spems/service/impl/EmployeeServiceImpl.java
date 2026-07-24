package com.enterprise.spems.service.impl;

import com.enterprise.spems.dto.request.CreateEmployeeRequest;
import com.enterprise.spems.dto.response.EmployeeDTO;
import com.enterprise.spems.exception.BadRequestException;
import com.enterprise.spems.exception.ResourceNotFoundException;
import com.enterprise.spems.model.entity.*;
import com.enterprise.spems.model.enums.EmployeeStatus;
import com.enterprise.spems.model.enums.RoleType;
import com.enterprise.spems.repository.*;
import com.enterprise.spems.service.EmployeeService;
import com.enterprise.spems.service.storage.StorageService;
import jakarta.persistence.criteria.Predicate;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class EmployeeServiceImpl implements EmployeeService {

    private final EmployeeRepository employeeRepository;
    private final DepartmentRepository departmentRepository;
    private final UserRepository userRepository;
    private final RoleRepository roleRepository;
    private final AuditLogRepository auditLogRepository;
    private final StorageService storageService;
    private final PasswordEncoder passwordEncoder;

    @Override
    @Transactional(readOnly = true)
    public Page<EmployeeDTO> getAllEmployees(Long departmentId, EmployeeStatus status, String search, Pageable pageable) {
        Specification<Employee> spec = (root, query, criteriaBuilder) -> {
            List<Predicate> predicates = new ArrayList<>();

            if (departmentId != null) {
                predicates.add(criteriaBuilder.equal(root.get("department").get("id"), departmentId));
            }
            if (status != null) {
                predicates.add(criteriaBuilder.equal(root.get("status"), status));
            }
            if (search != null && !search.isBlank()) {
                String term = "%" + search.trim().toLowerCase() + "%";
                Predicate searchFirstName = criteriaBuilder.like(criteriaBuilder.lower(root.get("firstName")), term);
                Predicate searchLastName = criteriaBuilder.like(criteriaBuilder.lower(root.get("lastName")), term);
                Predicate searchCode = criteriaBuilder.like(criteriaBuilder.lower(root.get("employeeCode")), term);
                Predicate searchEmail = criteriaBuilder.like(criteriaBuilder.lower(root.get("user").get("email")), term);
                predicates.add(criteriaBuilder.or(searchFirstName, searchLastName, searchCode, searchEmail));
            }

            return criteriaBuilder.and(predicates.toArray(new Predicate[0]));
        };

        return employeeRepository.findAll(spec, pageable).map(this::mapToDTO);
    }

    @Override
    @Transactional(readOnly = true)
    public EmployeeDTO getEmployeeById(Long id) {
        Employee employee = employeeRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Employee not found with id: " + id));
        return mapToDTO(employee);
    }

    /**
     * 12-Step Enterprise Employee Creation Workflow
     */
    @Override
    @Transactional
    public EmployeeDTO createEmployee(CreateEmployeeRequest request) {
        // Step 1: Validate required fields
        if (request.getEmail() == null || request.getFirstName() == null || request.getLastName() == null) {
            throw new BadRequestException("First name, last name, and email are required fields");
        }

        // Step 2: Check whether email address already exists
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new BadRequestException("Email address already exists in enterprise system: " + request.getEmail());
        }

        // Step 3: Check whether Employee ID / Code is unique
        String code = request.getEmployeeCode() != null && !request.getEmployeeCode().isBlank()
                ? request.getEmployeeCode()
                : "EMP-2026-" + Math.floor(1000 + Math.random() * 9000);

        if (employeeRepository.existsByEmployeeCode(code)) {
            code = "EMP-2026-" + UUID.randomUUID().toString().substring(0, 6).toUpperCase();
        }

        // Step 4: Resolve Role
        RoleType roleEnum = RoleType.ROLE_EMPLOYEE;
        if (request.getRole() != null) {
            try {
                roleEnum = RoleType.valueOf(request.getRole());
            } catch (Exception ignored) {}
        }
        Role role = roleRepository.findByName(roleEnum)
                .orElseThrow(() -> new ResourceNotFoundException("Role not found: " + request.getRole()));

        // Step 5: Create User Account with BCrypt Password
        String tempPass = request.getTemporaryPassword() != null ? request.getTemporaryPassword() : "TempPass@2026!";
        User user = User.builder()
                .email(request.getEmail())
                .passwordHash(passwordEncoder.encode(tempPass))
                .role(role)
                .isActive(true)
                .isVerified(true)
                .build();
        user = userRepository.save(user);

        // Step 6: Assign Department
        Department department = null;
        if (request.getDepartmentId() != null) {
            department = departmentRepository.findById(request.getDepartmentId())
                    .orElse(null);
        }

        // Step 7: Create Employee Record
        Employee employee = Employee.builder()
                .employeeCode(code)
                .firstName(request.getFirstName())
                .lastName(request.getLastName())
                .phone(request.getPhone())
                .designation(request.getDesignation() != null ? request.getDesignation() : "Software Engineer")
                .department(department)
                .organization(request.getOrganization() != null && !request.getOrganization().isBlank() ? request.getOrganization() : "SPEMS Enterprise HQ")
                .user(user)
                .status(EmployeeStatus.ACTIVE)
                .joiningDate(request.getJoiningDate() != null ? request.getJoiningDate() : LocalDate.now())
                .build();
        employee = employeeRepository.save(employee);

        // Step 8: Record action in Audit Log
        AuditLog auditLog = AuditLog.builder()
                .action("EMPLOYEE_CREATED")
                .user(user)
                .entityName("Employee")
                .entityId(employee.getId())
                .details("Created employee " + employee.getFirstName() + " " + employee.getLastName() + " (" + code + ") with role " + roleEnum)
                .ipAddress("127.0.0.1")
                .timestamp(LocalDateTime.now())
                .build();
        auditLogRepository.save(auditLog);

        // Step 9-12: Complete & Map DTO
        return mapToDTO(employee);
    }

    @Override
    @Transactional
    public EmployeeDTO updateEmployee(Long id, EmployeeDTO request) {
        Employee employee = employeeRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Employee not found with id: " + id));

        if (request.getFirstName() != null) employee.setFirstName(request.getFirstName());
        if (request.getLastName() != null) employee.setLastName(request.getLastName());
        if (request.getPhone() != null) employee.setPhone(request.getPhone());
        if (request.getDesignation() != null) employee.setDesignation(request.getDesignation());
        if (request.getOrganization() != null) employee.setOrganization(request.getOrganization());
        if (request.getStatus() != null) employee.setStatus(request.getStatus());

        if (request.getRole() != null && employee.getUser() != null) {
            try {
                RoleType newRoleType = RoleType.valueOf(request.getRole());
                Role newRole = roleRepository.findByName(newRoleType).orElse(null);
                if (newRole != null) {
                    employee.getUser().setRole(newRole);
                    userRepository.save(employee.getUser());
                }
            } catch (Exception ignored) {}
        }

        if (request.getDepartmentId() != null) {
            Department dept = departmentRepository.findById(request.getDepartmentId())
                    .orElseThrow(() -> new ResourceNotFoundException("Department not found"));
            employee.setDepartment(dept);
        }

        employee = employeeRepository.save(employee);
        return mapToDTO(employee);
    }

    @Override
    @Transactional
    public EmployeeDTO uploadAvatar(Long id, MultipartFile file) {
        Employee employee = employeeRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Employee not found with id: " + id));

        String avatarKey = storageService.store(file, "avatars");
        employee.setAvatarUrl("/api/v1/storage/files/" + avatarKey);
        employee = employeeRepository.save(employee);
        return mapToDTO(employee);
    }

    private EmployeeDTO mapToDTO(Employee employee) {
        return EmployeeDTO.builder()
                .id(employee.getId())
                .employeeCode(employee.getEmployeeCode())
                .firstName(employee.getFirstName())
                .lastName(employee.getLastName())
                .email(employee.getUser() != null ? employee.getUser().getEmail() : "")
                .phone(employee.getPhone())
                .role(employee.getUser() != null && employee.getUser().getRole() != null ? employee.getUser().getRole().getName().name() : "")
                .designation(employee.getDesignation())
                .departmentName(employee.getDepartment() != null ? employee.getDepartment().getName() : "")
                .departmentId(employee.getDepartment() != null ? employee.getDepartment().getId() : null)
                .joiningDate(employee.getJoiningDate())
                .avatarUrl(employee.getAvatarUrl())
                .organization(employee.getOrganization() != null && !employee.getOrganization().isBlank() ? employee.getOrganization() : "SPEMS Enterprise HQ")
                .status(employee.getStatus())
                .build();
    }
}
