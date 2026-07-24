package com.enterprise.spems.service;

import com.enterprise.spems.dto.request.CreateEmployeeRequest;
import com.enterprise.spems.dto.response.EmployeeDTO;
import com.enterprise.spems.model.enums.EmployeeStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.web.multipart.MultipartFile;

public interface EmployeeService {
    Page<EmployeeDTO> getAllEmployees(Long departmentId, EmployeeStatus status, String search, Pageable pageable);
    EmployeeDTO getEmployeeById(Long id);
    EmployeeDTO createEmployee(CreateEmployeeRequest request);
    EmployeeDTO updateEmployee(Long id, EmployeeDTO request);
    EmployeeDTO uploadAvatar(Long id, MultipartFile file);
}
