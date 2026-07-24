package com.enterprise.spems.controller;

import com.enterprise.spems.dto.ApiResponse;
import com.enterprise.spems.model.entity.Meeting;
import com.enterprise.spems.repository.MeetingRepository;
import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/meetings")
@RequiredArgsConstructor
public class MeetingController {

    private final MeetingRepository meetingRepository;

    @GetMapping
    public ResponseEntity<ApiResponse<List<Meeting>>> getAllMeetings(HttpServletRequest request) {
        List<Meeting> meetings = meetingRepository.findAll();
        return ResponseEntity.ok(ApiResponse.success(meetings, "Meetings retrieved successfully", request.getRequestURI()));
    }

    @PostMapping
    public ResponseEntity<ApiResponse<Meeting>> createMeeting(@RequestBody Meeting meeting, HttpServletRequest request) {
        Meeting saved = meetingRepository.save(meeting);
        return ResponseEntity.ok(ApiResponse.success(saved, "Meeting scheduled successfully", request.getRequestURI()));
    }
}
