package com.enterprise.spems.controller;

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
import org.springframework.web.bind.annotation.*;

import java.io.ByteArrayOutputStream;
import java.io.IOException;

@RestController
@RequestMapping("/api/v1/reports")
@RequiredArgsConstructor
public class ReportController {

    @GetMapping("/pdf")
    public void downloadPdfReport(
            @RequestParam(defaultValue = "SPEMS_Enterprise_Report") String title,
            HttpServletResponse response) throws IOException {

        response.setContentType("application/pdf");
        response.setHeader("Content-Disposition", "attachment; filename=\"" + title + ".pdf\"");

        try (PDDocument document = new PDDocument()) {
            PDPage page = new PDPage();
            document.addPage(page);

            try (PDPageContentStream contentStream = new PDPageContentStream(document, page)) {
                contentStream.beginText();
                contentStream.setFont(new PDType1Font(Standard14Fonts.FontName.HELVETICA_BOLD), 18);
                contentStream.newLineAtOffset(50, 750);
                contentStream.showText("SPEMS Enterprise Management System Report");
                contentStream.endText();

                contentStream.beginText();
                contentStream.setFont(new PDType1Font(Standard14Fonts.FontName.HELVETICA), 12);
                contentStream.newLineAtOffset(50, 720);
                contentStream.showText("Report Title: " + title);
                contentStream.newLineAtOffset(0, -20);
                contentStream.showText("Generated On: 2026-07-23");
                contentStream.newLineAtOffset(0, -20);
                contentStream.showText("System Status: All Enterprise Services Operational");
                contentStream.endText();
            }

            ByteArrayOutputStream baos = new ByteArrayOutputStream();
            document.save(baos);
            response.getOutputStream().write(baos.toByteArray());
            response.getOutputStream().flush();
        }
    }

    @GetMapping("/excel")
    public void downloadExcelReport(
            @RequestParam(defaultValue = "SPEMS_Enterprise_Data") String title,
            HttpServletResponse response) throws IOException {

        response.setContentType("application/vnd.openxmlformats-officedocument.spreadsheetml.sheet");
        response.setHeader("Content-Disposition", "attachment; filename=\"" + title + ".xlsx\"");

        try (Workbook workbook = new XSSFWorkbook()) {
            Sheet sheet = workbook.createSheet("SPEMS Export");

            Row headerRow = sheet.createRow(0);
            headerRow.createCell(0).setCellValue("ID");
            headerRow.createCell(1).setCellValue("Title / Name");
            headerRow.createCell(2).setCellValue("Category");
            headerRow.createCell(3).setCellValue("Status");

            Row dataRow1 = sheet.createRow(1);
            dataRow1.createCell(0).setCellValue(101);
            dataRow1.createCell(1).setCellValue("Global Mobile Banking 2.0");
            dataRow1.createCell(2).setCellValue("Engineering");
            dataRow1.createCell(3).setCellValue("ON_TRACK");

            ByteArrayOutputStream baos = new ByteArrayOutputStream();
            workbook.write(baos);
            response.getOutputStream().write(baos.toByteArray());
            response.getOutputStream().flush();
        }
    }
}
