package com.enterprise.spems.dto.request;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CreateEmployeeRequest {

    @NotBlank(message = "First name is required")
    private String firstName;

    @NotBlank(message = "Last name is required")
    private String lastName;

    @NotBlank(message = "Email is required")
    @Email(message = "Invalid email format")
    private String email;

    private String phone;
    private String employeeCode;
    private String designation;
    private Long departmentId;
    private Long teamId;
    private String role; // e.g., ROLE_EMPLOYEE, ROLE_PROJECT_MANAGER
    private String temporaryPassword;
    private LocalDate joiningDate;
    private String organization;
    private String primarySkill;
}
