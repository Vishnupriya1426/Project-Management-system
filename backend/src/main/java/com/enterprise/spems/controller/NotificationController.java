package com.enterprise.spems.controller;

import com.enterprise.spems.dto.ApiResponse;
import com.enterprise.spems.model.entity.Notification;
import com.enterprise.spems.repository.NotificationRepository;
import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/notifications")
@RequiredArgsConstructor
public class NotificationController {

    private final NotificationRepository notificationRepository;

    @GetMapping
    public ResponseEntity<ApiResponse<List<Notification>>> getNotifications(
            @RequestParam(required = false) Long recipientId,
            HttpServletRequest request) {

        List<Notification> notifications;
        if (recipientId != null) {
            notifications = notificationRepository.findByRecipientIdOrderByCreatedAtDesc(recipientId);
        } else {
            notifications = notificationRepository.findAll();
        }

        return ResponseEntity.ok(ApiResponse.success(notifications, "Notifications retrieved successfully", request.getRequestURI()));
    }

    @PutMapping("/{id}/read")
    public ResponseEntity<ApiResponse<Notification>> markAsRead(@PathVariable Long id, HttpServletRequest request) {
        return notificationRepository.findById(id)
                .map(n -> {
                    n.setIsRead(true);
                    Notification updated = notificationRepository.save(n);
                    return ResponseEntity.ok(ApiResponse.success(updated, "Notification marked as read", request.getRequestURI()));
                })
                .orElseGet(() -> ResponseEntity.notFound().build());
    }

    @PutMapping("/read-all")
    public ResponseEntity<ApiResponse<String>> markAllAsRead(HttpServletRequest request) {
        List<Notification> all = notificationRepository.findAll();
        all.forEach(n -> n.setIsRead(true));
        notificationRepository.saveAll(all);
        return ResponseEntity.ok(ApiResponse.success("All notifications marked as read", "Success", request.getRequestURI()));
    }
}
