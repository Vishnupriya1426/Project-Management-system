package com.enterprise.spems.controller;

import com.enterprise.spems.dto.ApiResponse;
import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/v1/timesheets")
@RequiredArgsConstructor
public class TimesheetController {

    @GetMapping
    public ResponseEntity<ApiResponse<List<Map<String, Object>>>> getTimesheets(HttpServletRequest request) {
        List<Map<String, Object>> entries = new ArrayList<>();

        Map<String, Object> t1 = new HashMap<>();
        t1.put("id", 1L);
        t1.put("workDate", "2026-07-20");
        t1.put("hoursLogged", 8.0);
        t1.put("status", "APPROVED");
        entries.add(t1);

        Map<String, Object> t2 = new HashMap<>();
        t2.put("id", 2L);
        t2.put("workDate", "2026-07-21");
        t2.put("hoursLogged", 8.0);
        t2.put("status", "APPROVED");
        entries.add(t2);

        Map<String, Object> t3 = new HashMap<>();
        t3.put("id", 3L);
        t3.put("workDate", "2026-07-22");
        t3.put("hoursLogged", 8.0);
        t3.put("status", "SUBMITTED");
        entries.add(t3);

        return ResponseEntity.ok(ApiResponse.success(entries, "Timesheets retrieved successfully", request.getRequestURI()));
    }

    @PostMapping
    public ResponseEntity<ApiResponse<Map<String, Object>>> createTimesheet(@RequestBody Map<String, Object> payload, HttpServletRequest request) {
        payload.put("id", System.currentTimeMillis());
        payload.put("status", "SUBMITTED");
        return ResponseEntity.ok(ApiResponse.success(payload, "Timesheet submitted successfully", request.getRequestURI()));
    }
}
