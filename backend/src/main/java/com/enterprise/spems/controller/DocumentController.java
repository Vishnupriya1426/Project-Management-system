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
@RequestMapping("/api/v1/documents")
@RequiredArgsConstructor
public class DocumentController {

    @GetMapping
    public ResponseEntity<ApiResponse<List<Map<String, Object>>>> getDocuments(HttpServletRequest request) {
        List<Map<String, Object>> docs = new ArrayList<>();
        
        Map<String, Object> d1 = new HashMap<>();
        d1.put("id", 1L);
        d1.put("originalName", "Official_Offer_Letter_SPEMS.pdf");
        d1.put("category", "Offer Letter");
        d1.put("fileSize", "1.2 MB");
        d1.put("uploadDate", "2026-01-10");
        d1.put("isCompanyIssued", true);
        docs.add(d1);

        Map<String, Object> d2 = new HashMap<>();
        d2.put("id", 2L);
        d2.put("originalName", "AWS_Certified_Solutions_Architect.pdf");
        d2.put("category", "Certificates");
        d2.put("fileSize", "2.4 MB");
        d2.put("uploadDate", "2026-03-15");
        d2.put("isCompanyIssued", false);
        docs.add(d2);

        Map<String, Object> d3 = new HashMap<>();
        d3.put("id", 3L);
        d3.put("originalName", "Architecture_Blueprint_Migration_v2.pdf");
        d3.put("category", "Project Documents");
        d3.put("fileSize", "5.8 MB");
        d3.put("uploadDate", "2026-07-12");
        d3.put("isCompanyIssued", true);
        docs.add(d3);

        return ResponseEntity.ok(ApiResponse.success(docs, "Documents retrieved successfully", request.getRequestURI()));
    }
}
