package com.enterprise.spems.controller;

import com.enterprise.spems.dto.ApiResponse;
import com.enterprise.spems.model.entity.Client;
import com.enterprise.spems.model.entity.Role;
import com.enterprise.spems.model.entity.User;
import com.enterprise.spems.model.enums.RoleType;
import com.enterprise.spems.repository.ClientRepository;
import com.enterprise.spems.repository.RoleRepository;
import com.enterprise.spems.repository.UserRepository;
import com.enterprise.spems.service.AuditLogService;
import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/v1/clients")
@RequiredArgsConstructor
public class ClientController {

    private final ClientRepository clientRepository;
    private final UserRepository userRepository;
    private final RoleRepository roleRepository;
    private final PasswordEncoder passwordEncoder;
    private final AuditLogService auditLogService;

    @GetMapping
    public ResponseEntity<ApiResponse<List<Client>>> getAllClients(HttpServletRequest request) {
        List<Client> clients = clientRepository.findAll();
        return ResponseEntity
                .ok(ApiResponse.success(clients, "Clients retrieved successfully", request.getRequestURI()));
    }

    @PostMapping
    public ResponseEntity<ApiResponse<Client>> createClient(@RequestBody Map<String, Object> payload, HttpServletRequest request) {
        String companyName = (String) payload.get("companyName");
        String contactPerson = (String) payload.get("contactPerson");
        String email = (String) payload.get("email");
        String phone = (String) payload.get("phone");
        String industry = (String) payload.get("industry");
        String rawContract = String.valueOf(payload.getOrDefault("contractValue", "0"));
        
        String password = (String) payload.get("password");
        if (password == null || password.isBlank()) {
            password = (String) payload.get("temporaryPassword");
        }
        if (password == null || password.isBlank()) {
            password = "ClientPass@2026!";
        }

        if (companyName == null || companyName.trim().isEmpty()) {
            return ResponseEntity.badRequest().body(ApiResponse.error("Company Name is required", request.getRequestURI()));
        }
        if (contactPerson == null || contactPerson.trim().isEmpty()) {
            return ResponseEntity.badRequest().body(ApiResponse.error("Contact Person is required", request.getRequestURI()));
        }
        if (email == null || email.trim().isEmpty()) {
            return ResponseEntity.badRequest().body(ApiResponse.error("Corporate Email is required", request.getRequestURI()));
        }
        if (!email.matches("^[\\w-\\.]+@([\\w-]+\\.)+[\\w-]{2,4}$")) {
            return ResponseEntity.badRequest().body(ApiResponse.error("Invalid Corporate Email format", request.getRequestURI()));
        }

        // 1. Onboard / Create User account with ROLE_CLIENT for Client Portal login
        User user = userRepository.findByEmail(email).orElse(null);
        if (user == null) {
            Role clientRole = roleRepository.findByName(RoleType.ROLE_CLIENT)
                    .orElseGet(() -> roleRepository.save(Role.builder().name(RoleType.ROLE_CLIENT).description("Corporate Client Portal Role").build()));

            user = User.builder()
                    .email(email)
                    .passwordHash(passwordEncoder.encode(password))
                    .role(clientRole)
                    .isActive(true)
                    .isVerified(true)
                    .createdAt(LocalDateTime.now())
                    .build();
            user = userRepository.save(user);
        } else {
            user.setPasswordHash(passwordEncoder.encode(password));
            user = userRepository.save(user);
        }

        // 2. Create / Link Client Record in MySQL
        BigDecimal contractVal = BigDecimal.ZERO;
        try {
            contractVal = new BigDecimal(rawContract.replaceAll("[^0-9.]", ""));
        } catch (Exception ignored) {}

        Client client = Client.builder()
                .companyName(companyName != null ? companyName : "Corporate Client")
                .contactPerson(contactPerson != null ? contactPerson : "Primary Contact")
                .email(email)
                .phone(phone != null ? phone : "")
                .industry(industry != null ? industry : "Banking & Financial Technology")
                .contractValue(contractVal)
                .contractStatus("ACTIVE")
                .user(user)
                .build();

        Client created = clientRepository.save(client);

        // 3. Automatic Audit Logging
        try {
            auditLogService.logEvent(
                    user,
                    "admin@spems.com",
                    "ROLE_SUPER_ADMIN",
                    "Organization",
                    "Organization Created",
                    "Organization",
                    created.getId(),
                    request.getRemoteAddr() != null ? request.getRemoteAddr() : "127.0.0.1",
                    "SUCCESS",
                    "Provisioned Corporate Client '" + created.getCompanyName() + "' with Client Portal account for " + email + "."
            );
        } catch (Exception ignored) {}

        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success(created, "Corporate Client account created successfully", request.getRequestURI()));
    }
}
