package com.enterprise.spems.dto.response;

import com.enterprise.spems.model.enums.EmployeeStatus;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class EmployeeDTO {

    private Long id;
    private String employeeCode;
    private String firstName;
    private String lastName;
    private String email;
    private String phone;
    private String role;
    private String designation;
    private String departmentName;
    private Long departmentId;
    private LocalDate joiningDate;
    private String avatarUrl;
    private String organization;
    private EmployeeStatus status;
}
