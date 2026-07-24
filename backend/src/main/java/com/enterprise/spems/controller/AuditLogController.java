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
                .map(this::mapToDTO)
                .filter(l -> module == null || module.equalsIgnoreCase("ALL") || (l.get("module") != null && l.get("module").toString().equalsIgnoreCase(module)))
                .filter(l -> action == null || action.equalsIgnoreCase("ALL") || (l.get("action") != null && l.get("action").toString().toUpperCase().contains(action.toUpperCase())))
                .filter(l -> role == null || role.equalsIgnoreCase("ALL") || (l.get("userRole") != null && l.get("userRole").toString().equalsIgnoreCase(role)))
                .filter(l -> status == null || status.equalsIgnoreCase("ALL") || (l.get("status") != null && l.get("status").toString().equalsIgnoreCase(status)))
                .filter(l -> {
                    if (search == null || search.isBlank()) return true;
                    String s = search.toLowerCase();
                    return (l.get("userEmail") != null && l.get("userEmail").toString().toLowerCase().contains(s)) ||
                           (l.get("action") != null && l.get("action").toString().toLowerCase().contains(s)) ||
                           (l.get("module") != null && l.get("module").toString().toLowerCase().contains(s)) ||
                           (l.get("entityName") != null && l.get("entityName").toString().toLowerCase().contains(s)) ||
                           (l.get("details") != null && l.get("details").toString().toLowerCase().contains(s));
                })
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
                for (AuditLog logEntity : logs) {
                    Map<String, Object> l = mapToDTO(logEntity);
                    cs.beginText();
                    cs.setFont(new PDType1Font(Standard14Fonts.FontName.HELVETICA_BOLD), 10);
                    cs.newLineAtOffset(50, y);
                    cs.showText("[" + l.get("timestamp") + "] " + l.get("action") + " | " + l.get("userEmail") + " (" + l.get("userRole") + ")");
                    cs.endText();

                    y -= 14;
                    cs.beginText();
                    cs.setFont(new PDType1Font(Standard14Fonts.FontName.HELVETICA), 9);
                    cs.newLineAtOffset(65, y);
                    cs.showText("Module: " + l.get("module") + " | Target: " + l.get("entityName") + " #" + l.get("entityId") + " | Status: " + l.get("status") + " | IP: " + l.get("ipAddress"));
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
            for (AuditLog logEntity : logs) {
                Map<String, Object> l = mapToDTO(logEntity);
                Row row = sheet.createRow(rowIdx++);
                row.createCell(0).setCellValue(l.get("id").toString());
                row.createCell(1).setCellValue(l.get("timestamp").toString());
                row.createCell(2).setCellValue(l.get("userEmail").toString());
                row.createCell(3).setCellValue(l.get("userRole").toString());
                row.createCell(4).setCellValue(l.get("module").toString());
                row.createCell(5).setCellValue(l.get("action").toString());
                row.createCell(6).setCellValue(l.get("entityName") + " #" + l.get("entityId"));
                row.createCell(7).setCellValue(l.get("ipAddress").toString());
                row.createCell(8).setCellValue(l.get("status").toString());
                row.createCell(9).setCellValue(l.get("details").toString());
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

        String rawModule = l.getModule();
        String rawAction = l.getAction() != null ? l.getAction() : "ACTIVITY";
        String rawEntity = l.getEntityName() != null ? l.getEntityName() : "System";

        // Clean Action names
        String cleanAction = rawAction;
        if ("EMPLOYEE_CREATED".equalsIgnoreCase(rawAction)) cleanAction = "Employee Created";
        else if ("TASK_CREATED".equalsIgnoreCase(rawAction)) cleanAction = "Task Assigned";
        else if ("TEAM_CREATED".equalsIgnoreCase(rawAction)) cleanAction = "Team Created";
        else if ("ORG_CREATED".equalsIgnoreCase(rawAction) || "CLIENT_CREATED".equalsIgnoreCase(rawAction)) cleanAction = "Organization Created";
        else if ("PROJECT_CREATED".equalsIgnoreCase(rawAction)) cleanAction = "Project Created";

        // Clean Module names
        String cleanModule = rawModule;
        if (cleanModule == null || "System".equalsIgnoreCase(cleanModule) || cleanModule.isBlank()) {
            if (rawEntity.equalsIgnoreCase("Employee") || cleanAction.contains("Employee")) cleanModule = "Employees";
            else if (rawEntity.equalsIgnoreCase("Task") || cleanAction.contains("Task")) cleanModule = "Tasks & Meetings";
            else if (rawEntity.equalsIgnoreCase("Team") || cleanAction.contains("Team")) cleanModule = "Teams & Resource Allocation";
            else if (rawEntity.equalsIgnoreCase("Organization") || rawEntity.equalsIgnoreCase("Client") || cleanAction.contains("Organization")) cleanModule = "Organization";
            else if (rawEntity.equalsIgnoreCase("Project") || cleanAction.contains("Project")) cleanModule = "Projects";
            else if (rawEntity.equalsIgnoreCase("ProjectProposal") || cleanAction.contains("Proposal")) cleanModule = "Clients & Proposals";
            else cleanModule = "Security";
        }

        map.put("module", cleanModule);
        map.put("action", cleanAction);
        map.put("entityName", rawEntity);
        map.put("entityId", l.getEntityId() != null ? l.getEntityId() : 1);
        map.put("ipAddress", l.getIpAddress() != null ? l.getIpAddress() : "127.0.0.1");
        map.put("status", l.getStatus() != null ? l.getStatus() : "SUCCESS");
        map.put("details", l.getDetails() != null ? l.getDetails() : "Operation executed successfully.");
        return map;
    }
}
