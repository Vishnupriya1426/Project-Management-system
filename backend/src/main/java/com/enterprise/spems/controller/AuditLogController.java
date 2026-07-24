package com.enterprise.spems.controller;

import com.enterprise.spems.dto.ApiResponse;
import com.enterprise.spems.model.entity.AuditLog;
import com.enterprise.spems.repository.AuditLogRepository;
import com.enterprise.spems.service.AuditLogService;
import jakarta.annotation.PostConstruct;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import org.apache.pdfbox.pdmodel.PDDocument;
import org.apache.pdfbox.pdmodel.PDPage;
import org.apache.pdfbox.pdmodel.PDPageContentStream;
import org.apache.pdfbox.pdmodel.font.PDType1Font;
import org.apache.pdfbox.pdmodel.font.Standard14Fonts;
import org.apache.poi.ss.usermodel.Row;
import org.apache.poi.ss.usermodel.Sheet;
import org.apache.poi.ss.usermodel.Workbook;
import org.apache.poi.xssf.usermodel.XSSFWorkbook;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.*;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/v1/audit-logs")
@RequiredArgsConstructor
public class AuditLogController {

    private final AuditLogRepository auditLogRepository;
    private final AuditLogService auditLogService;

    @PostConstruct
    public void initDefaultAuditLogs() {
        if (auditLogRepository.count() == 0) {
            auditLogService.logEvent(null, "admin@spems.com", "ROLE_SUPER_ADMIN", "Authentication", "Login", "User", 1L, "127.0.0.1", "SUCCESS", "Super Admin logged in successfully with MFA authentication.");
            auditLogService.logEvent(null, "admin@spems.com", "ROLE_SUPER_ADMIN", "Organization", "Organization Created", "Organization", 1L, "127.0.0.1", "SUCCESS", "Created primary enterprise organization profile 'SPEMS Enterprise HQ'.");
            auditLogService.logEvent(null, "pm@spems.com", "ROLE_PROJECT_MANAGER", "Employees", "Employee Created", "Employee", 101L, "192.168.1.45", "SUCCESS", "Registered new senior developer account for Engineering squad.");
            auditLogService.logEvent(null, "client@globalbank.com", "ROLE_CLIENT", "Clients & Proposals", "Proposal Submitted", "ProjectProposal", 201L, "172.16.0.12", "SUCCESS", "Submitted RFP proposal 'Global Banking 2.0 Modernization'.");
            auditLogService.logEvent(null, "pm@spems.com", "ROLE_PROJECT_MANAGER", "Projects", "Project Created", "Project", 301L, "192.168.1.45", "SUCCESS", "Initialized project workspace 'Healthcare Patient Portal'.");
            auditLogService.logEvent(null, "admin@spems.com", "ROLE_SUPER_ADMIN", "Reports", "PDF Export", "Report", 401L, "127.0.0.1", "SUCCESS", "Downloaded Executive Performance Analytics PDF report.");
            auditLogService.logEvent(null, "engmanager@spems.com", "ROLE_ENG_MANAGER", "Teams & Resource Allocation", "Employee Assigned", "Team", 501L, "192.168.1.88", "SUCCESS", "Assigned 3 full-stack engineers to Sprint 15 velocity team.");
            auditLogService.logEvent(null, "admin@spems.com", "ROLE_SUPER_ADMIN", "Security", "Permission Changed", "Role", 1L, "127.0.0.1", "SUCCESS", "Updated granular role permissions for Project Managers.");
        }
    }

    @GetMapping
    public ResponseEntity<ApiResponse<List<Map<String, Object>>>> getAllAuditLogs(
            @RequestParam(required = false) String module,
            @RequestParam(required = false) String action,
            @RequestParam(required = false) String role,
            @RequestParam(required = false) String status,
            @RequestParam(required = false) String search,
            HttpServletRequest request) {

        List<AuditLog> logs = auditLogRepository.findAll();
        logs.sort((a, b) -> {
            if (a.getTimestamp() == null || b.getTimestamp() == null) return 0;
            return b.getTimestamp().compareTo(a.getTimestamp());
        });

        List<Map<String, Object>> result = logs.stream()
                .filter(l -> module == null || module.equalsIgnoreCase("ALL") || (l.getModule() != null && l.getModule().equalsIgnoreCase(module)))
                .filter(l -> action == null || action.equalsIgnoreCase("ALL") || (l.getAction() != null && l.getAction().toUpperCase().contains(action.toUpperCase())))
                .filter(l -> role == null || role.equalsIgnoreCase("ALL") || (l.getUserRole() != null && l.getUserRole().equalsIgnoreCase(role)))
                .filter(l -> status == null || status.equalsIgnoreCase("ALL") || (l.getStatus() != null && l.getStatus().equalsIgnoreCase(status)))
                .filter(l -> {
                    if (search == null || search.isBlank()) return true;
                    String s = search.toLowerCase();
                    return (l.getUserEmail() != null && l.getUserEmail().toLowerCase().contains(s)) ||
                           (l.getAction() != null && l.getAction().toLowerCase().contains(s)) ||
                           (l.getModule() != null && l.getModule().toLowerCase().contains(s)) ||
                           (l.getEntityName() != null && l.getEntityName().toLowerCase().contains(s)) ||
                           (l.getDetails() != null && l.getDetails().toLowerCase().contains(s));
                })
                .map(this::mapToDTO)
                .collect(Collectors.toList());

        return ResponseEntity.ok(ApiResponse.success(result, "Immutable audit logs retrieved successfully", request.getRequestURI()));
    }

    @GetMapping("/pdf")
    public void downloadPdfAuditLogs(HttpServletResponse response) throws IOException {
        response.setContentType("application/pdf");
        response.setHeader("Content-Disposition", "attachment; filename=\"SPEMS_Audit_Trail_Report.pdf\"");

        List<AuditLog> logs = auditLogRepository.findAll();
        logs.sort((a, b) -> {
            if (a.getTimestamp() == null || b.getTimestamp() == null) return 0;
            return b.getTimestamp().compareTo(a.getTimestamp());
        });

        try (PDDocument document = new PDDocument()) {
            PDPage page = new PDPage();
            document.addPage(page);

            try (PDPageContentStream cs = new PDPageContentStream(document, page)) {
                cs.beginText();
                cs.setFont(new PDType1Font(Standard14Fonts.FontName.HELVETICA_BOLD), 18);
                cs.newLineAtOffset(50, 750);
                cs.showText("SPEMS Enterprise System Audit Trail");
                cs.endText();

                cs.beginText();
                cs.setFont(new PDType1Font(Standard14Fonts.FontName.HELVETICA), 10);
                cs.newLineAtOffset(50, 725);
                cs.showText("Generated On: " + LocalDateTime.now().format(DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss")) + " | Scope: Compliance & Security");
                cs.endText();

                int y = 690;
                for (AuditLog l : logs) {
                    cs.beginText();
                    cs.setFont(new PDType1Font(Standard14Fonts.FontName.HELVETICA_BOLD), 10);
                    cs.newLineAtOffset(50, y);
                    String ts = l.getTimestamp() != null ? l.getTimestamp().format(DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm")) : "2026-07-24";
                    cs.showText("[" + ts + "] " + (l.getAction() != null ? l.getAction() : "ACTION") + " | " + (l.getUserEmail() != null ? l.getUserEmail() : "admin@spems.com") + " (" + (l.getUserRole() != null ? l.getUserRole() : "ROLE_SUPER_ADMIN") + ")");
                    cs.endText();

                    y -= 14;
                    cs.beginText();
                    cs.setFont(new PDType1Font(Standard14Fonts.FontName.HELVETICA), 9);
                    cs.newLineAtOffset(65, y);
                    cs.showText("Module: " + (l.getModule() != null ? l.getModule() : "System") + " | Target: " + l.getEntityName() + " #" + (l.getEntityId() != null ? l.getEntityId() : 1) + " | Status: " + (l.getStatus() != null ? l.getStatus() : "SUCCESS") + " | IP: " + (l.getIpAddress() != null ? l.getIpAddress() : "127.0.0.1"));
                    cs.endText();

                    y -= 20;
                    if (y < 80) break;
                }
            }

            ByteArrayOutputStream baos = new ByteArrayOutputStream();
            document.save(baos);
            response.getOutputStream().write(baos.toByteArray());
            response.getOutputStream().flush();
        }
    }

    @GetMapping("/excel")
    public void downloadExcelAuditLogs(HttpServletResponse response) throws IOException {
        response.setContentType("application/vnd.openxmlformats-officedocument.spreadsheetml.sheet");
        response.setHeader("Content-Disposition", "attachment; filename=\"SPEMS_Audit_Logs.xlsx\"");

        List<AuditLog> logs = auditLogRepository.findAll();

        try (Workbook workbook = new XSSFWorkbook()) {
            Sheet sheet = workbook.createSheet("Audit Logs");

            Row headerRow = sheet.createRow(0);
            headerRow.createCell(0).setCellValue("Log ID");
            headerRow.createCell(1).setCellValue("Timestamp");
            headerRow.createCell(2).setCellValue("User Email");
            headerRow.createCell(3).setCellValue("Role");
            headerRow.createCell(4).setCellValue("Module");
            headerRow.createCell(5).setCellValue("Action");
            headerRow.createCell(6).setCellValue("Entity Target");
            headerRow.createCell(7).setCellValue("IP Address");
            headerRow.createCell(8).setCellValue("Status");
            headerRow.createCell(9).setCellValue("Details");

            int rowIdx = 1;
            for (AuditLog l : logs) {
                Row row = sheet.createRow(rowIdx++);
                row.createCell(0).setCellValue(l.getId() != null ? l.getId() : rowIdx);
                row.createCell(1).setCellValue(l.getTimestamp() != null ? l.getTimestamp().toString() : "");
                row.createCell(2).setCellValue(l.getUserEmail() != null ? l.getUserEmail() : "admin@spems.com");
                row.createCell(3).setCellValue(l.getUserRole() != null ? l.getUserRole() : "ROLE_SUPER_ADMIN");
                row.createCell(4).setCellValue(l.getModule() != null ? l.getModule() : "System");
                row.createCell(5).setCellValue(l.getAction() != null ? l.getAction() : "");
                row.createCell(6).setCellValue((l.getEntityName() != null ? l.getEntityName() : "") + " #" + (l.getEntityId() != null ? l.getEntityId() : 0));
                row.createCell(7).setCellValue(l.getIpAddress() != null ? l.getIpAddress() : "127.0.0.1");
                row.createCell(8).setCellValue(l.getStatus() != null ? l.getStatus() : "SUCCESS");
                row.createCell(9).setCellValue(l.getDetails() != null ? l.getDetails() : "");
            }

            ByteArrayOutputStream baos = new ByteArrayOutputStream();
            workbook.write(baos);
            response.getOutputStream().write(baos.toByteArray());
            response.getOutputStream().flush();
        }
    }

    private Map<String, Object> mapToDTO(AuditLog l) {
        Map<String, Object> map = new HashMap<>();
        map.put("id", l.getId());
        map.put("timestamp", l.getTimestamp() != null ? l.getTimestamp().format(DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss")) : "2026-07-24 10:00:00");
        map.put("userEmail", l.getUserEmail() != null ? l.getUserEmail() : "admin@spems.com");
        map.put("userRole", l.getUserRole() != null ? l.getUserRole() : "ROLE_SUPER_ADMIN");
        map.put("module", l.getModule() != null ? l.getModule() : "System");
        map.put("action", l.getAction() != null ? l.getAction() : "ACTIVITY");
        map.put("entityName", l.getEntityName() != null ? l.getEntityName() : "System");
        map.put("entityId", l.getEntityId() != null ? l.getEntityId() : 1);
        map.put("ipAddress", l.getIpAddress() != null ? l.getIpAddress() : "127.0.0.1");
        map.put("status", l.getStatus() != null ? l.getStatus() : "SUCCESS");
        map.put("details", l.getDetails() != null ? l.getDetails() : "{}");
        return map;
    }
}
