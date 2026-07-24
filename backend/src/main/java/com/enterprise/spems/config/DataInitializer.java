package com.enterprise.spems.config;

import com.enterprise.spems.model.entity.Department;
import com.enterprise.spems.model.entity.Employee;
import com.enterprise.spems.model.entity.Role;
import com.enterprise.spems.model.entity.User;
import com.enterprise.spems.model.enums.RoleType;
import com.enterprise.spems.repository.DepartmentRepository;
import com.enterprise.spems.repository.EmployeeRepository;
import com.enterprise.spems.repository.RoleRepository;
import com.enterprise.spems.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.util.Arrays;

@Component
@RequiredArgsConstructor
@Slf4j
public class DataInitializer implements CommandLineRunner {

    private final RoleRepository roleRepository;
    private final UserRepository userRepository;
    private final EmployeeRepository employeeRepository;
    private final DepartmentRepository departmentRepository;
    private final PasswordEncoder passwordEncoder;

    @Override
    @Transactional
    public void run(String... args) throws Exception {
        log.info("Checking database initial seed data...");

        // 1. Seed Roles
        for (RoleType roleType : RoleType.values()) {
            if (roleRepository.findByName(roleType).isEmpty()) {
                Role role = Role.builder()
                        .name(roleType)
                        .description(roleType.name() + " Enterprise System Role")
                        .build();
                roleRepository.save(role);
                log.info("Seeded Role: {}", roleType);
            }
        }

        // 2. Seed Default Departments
        if (departmentRepository.count() == 0) {
            Department eng = Department.builder().name("Engineering & Technology").code("ENG").build();
            Department hr = Department.builder().name("Human Resources").code("HR").build();
            Department pm = Department.builder().name("Project Management Office").code("PMO").build();
            Department qa = Department.builder().name("Quality Assurance").code("QA").build();
            departmentRepository.saveAll(Arrays.asList(eng, hr, pm, qa));
            log.info("Seeded default departments: ENG, HR, PMO, QA");
        }

        // 3. Seed Super Admin User
        String adminEmail = "admin@spems.com";
        if (!userRepository.existsByEmail(adminEmail)) {
            Role superAdminRole = roleRepository.findByName(RoleType.ROLE_SUPER_ADMIN).orElseThrow();
            Department engDept = departmentRepository.findByCode("ENG").orElse(null);

            User adminUser = User.builder()
                    .email(adminEmail)
                    .passwordHash(passwordEncoder.encode("Admin@123"))
                    .role(superAdminRole)
                    .isActive(true)
                    .isVerified(true)
                    .build();
            adminUser = userRepository.save(adminUser);

            Employee adminEmployee = Employee.builder()
                    .user(adminUser)
                    .employeeCode("EMP-00001")
                    .firstName("Super")
                    .lastName("Admin")
                    .designation("Principal Enterprise Administrator")
                    .department(engDept)
                    .build();
            employeeRepository.save(adminEmployee);

            log.info("Seeded Super Admin user: admin@spems.com / Admin@123");
        }

        // 4. Seed Engineering HOD User
        String hodEmail = "sarah.c@spems.com";
        if (!userRepository.existsByEmail(hodEmail)) {
            Role engManagerRole = roleRepository.findByName(RoleType.ROLE_ENG_MANAGER)
                    .orElse(roleRepository.findByName(RoleType.ROLE_ADMIN).orElseThrow());
            Department engDept = departmentRepository.findByCode("ENG").orElse(null);

            User hodUser = User.builder()
                    .email(hodEmail)
                    .passwordHash(passwordEncoder.encode("Admin@123"))
                    .role(engManagerRole)
                    .isActive(true)
                    .isVerified(true)
                    .build();
            hodUser = userRepository.save(hodUser);

            Employee hodEmployee = Employee.builder()
                    .user(hodUser)
                    .employeeCode("EMP-00002")
                    .firstName("Sarah")
                    .lastName("Connor")
                    .designation("Head of Engineering & Technology")
                    .department(engDept)
                    .build();
            employeeRepository.save(hodEmployee);
            log.info("Seeded HOD user: sarah.c@spems.com / Admin@123");
        }

        // 5. Seed Project Manager User
        String pmEmail = "alex.m@spems.com";
        if (!userRepository.existsByEmail(pmEmail)) {
            Role pmRole = roleRepository.findByName(RoleType.ROLE_PROJECT_MANAGER)
                    .orElse(roleRepository.findByName(RoleType.ROLE_ADMIN).orElseThrow());
            Department pmDept = departmentRepository.findByCode("PMO").orElse(null);

            User pmUser = User.builder()
                    .email(pmEmail)
                    .passwordHash(passwordEncoder.encode("Admin@123"))
                    .role(pmRole)
                    .isActive(true)
                    .isVerified(true)
                    .build();
            pmUser = userRepository.save(pmUser);

            Employee pmEmployee = Employee.builder()
                    .user(pmUser)
                    .employeeCode("EMP-00003")
                    .firstName("Alex")
                    .lastName("Murphy")
                    .designation("Senior Project Manager")
                    .department(pmDept)
                    .build();
            employeeRepository.save(pmEmployee);
            log.info("Seeded PM user: alex.m@spems.com / Admin@123");
        }

        // 6. Seed Corporate Client User
        String clientEmail = "robert@globalbank.com";
        if (!userRepository.existsByEmail(clientEmail)) {
            Role clientRole = roleRepository.findByName(RoleType.ROLE_CLIENT).orElseThrow();

            User clientUser = User.builder()
                    .email(clientEmail)
                    .passwordHash(passwordEncoder.encode("ClientPass@2026!"))
                    .role(clientRole)
                    .isActive(true)
                    .isVerified(true)
                    .build();
            userRepository.save(clientUser);
            log.info("Seeded Client user: robert@globalbank.com / ClientPass@2026!");
        }
    }
}
