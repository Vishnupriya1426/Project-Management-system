package com.enterprise.spems.repository;

import com.enterprise.spems.model.entity.Employee;
import com.enterprise.spems.model.entity.User;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface EmployeeRepository extends JpaRepository<Employee, Long>, JpaSpecificationExecutor<Employee> {

    @EntityGraph(attributePaths = {"user", "user.role", "department"})
    Optional<Employee> findByUser(User user);

    @EntityGraph(attributePaths = {"user", "user.role", "department"})
    Optional<Employee> findByEmployeeCode(String employeeCode);

    boolean existsByEmployeeCode(String employeeCode);

    long countByDepartmentId(Long departmentId);
}
