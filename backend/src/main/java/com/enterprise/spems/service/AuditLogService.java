package com.enterprise.spems.service;

import com.enterprise.spems.model.entity.AuditLog;
import com.enterprise.spems.model.entity.User;
import com.enterprise.spems.repository.AuditLogRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Propagation;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;

@Service
@RequiredArgsConstructor
public class AuditLogService {

    private final AuditLogRepository auditLogRepository;

    @Transactional(propagation = Propagation.REQUIRES_NEW)
    public void logEvent(User user, String userEmail, String role, String module, String action, String entityName, Long entityId, String ipAddress, String status, String details) {
        try {
            String resolvedEmail = userEmail;
            if (resolvedEmail == null || resolvedEmail.isBlank()) {
                resolvedEmail = (user != null && user.getEmail() != null) ? user.getEmail() : "admin@spems.com";
            }

            String resolvedRole = role;
            if (resolvedRole == null || resolvedRole.isBlank()) {
                if (user != null && user.getRole() != null && user.getRole().getName() != null) {
                    resolvedRole = user.getRole().getName().name();
                } else {
                    resolvedRole = "ROLE_SUPER_ADMIN";
                }
            }

            AuditLog log = AuditLog.builder()
                    .user(user)
                    .userEmail(resolvedEmail)
                    .userRole(resolvedRole)
                    .module(module != null ? module : "System")
                    .action(action != null ? action : "ACTIVITY")
                    .entityName(entityName != null ? entityName : "System")
                    .entityId(entityId != null ? entityId : 0L)
                    .ipAddress(ipAddress != null ? ipAddress : "127.0.0.1")
                    .status(status != null ? status : "SUCCESS")
                    .details(details != null ? details : "Operation executed successfully")
                    .timestamp(LocalDateTime.now())
                    .build();

            auditLogRepository.save(log);
        } catch (Exception ignored) {}
    }
}
