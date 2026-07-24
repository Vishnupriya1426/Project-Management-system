package com.enterprise.spems.controller;

import com.enterprise.spems.dto.ApiResponse;
import com.enterprise.spems.model.entity.Notification;
import com.enterprise.spems.repository.NotificationRepository;
import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/v1/notifications")
@RequiredArgsConstructor
public class NotificationController {

    private final NotificationRepository notificationRepository;

    /**
     * GET /notifications?recipientId={userId}
     * Returns notifications scoped to the given user.
     * If no recipientId is supplied (e.g. Super-Admin overview), returns all.
     */
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

    /**
     * GET /notifications/unread-count?recipientId={userId}
     * Fast count of unread notifications for the given user — used for header badge.
     */
    @GetMapping("/unread-count")
    public ResponseEntity<ApiResponse<Map<String, Long>>> getUnreadCount(
            @RequestParam(required = false) Long recipientId,
            HttpServletRequest request) {

        long count;
        if (recipientId != null) {
            count = notificationRepository.countByRecipientIdAndIsReadFalse(recipientId);
        } else {
            count = notificationRepository.findAll().stream().filter(n -> Boolean.FALSE.equals(n.getIsRead())).count();
        }

        return ResponseEntity.ok(ApiResponse.success(Map.of("unreadCount", count), "Unread count retrieved", request.getRequestURI()));
    }

    /**
     * PUT /notifications/{id}/read
     * Mark a single notification as read.
     */
    @PutMapping("/{id}/read")
    public ResponseEntity<ApiResponse<Notification>> markAsRead(
            @PathVariable Long id,
            HttpServletRequest request) {

        return notificationRepository.findById(id)
                .map(n -> {
                    n.setIsRead(true);
                    Notification updated = notificationRepository.save(n);
                    return ResponseEntity.ok(ApiResponse.success(updated, "Notification marked as read", request.getRequestURI()));
                })
                .orElseGet(() -> ResponseEntity.notFound().build());
    }

    /**
     * PUT /notifications/{id}/unread
     * Toggle a notification back to unread.
     */
    @PutMapping("/{id}/unread")
    public ResponseEntity<ApiResponse<Notification>> markAsUnread(
            @PathVariable Long id,
            HttpServletRequest request) {

        return notificationRepository.findById(id)
                .map(n -> {
                    n.setIsRead(false);
                    Notification updated = notificationRepository.save(n);
                    return ResponseEntity.ok(ApiResponse.success(updated, "Notification marked as unread", request.getRequestURI()));
                })
                .orElseGet(() -> ResponseEntity.notFound().build());
    }

    /**
     * PUT /notifications/read-all?recipientId={userId}
     * Mark ALL notifications as read — SCOPED to the given user.
     * Without recipientId, marks all (admin use only).
     */
    @PutMapping("/read-all")
    public ResponseEntity<ApiResponse<String>> markAllAsRead(
            @RequestParam(required = false) Long recipientId,
            HttpServletRequest request) {

        List<Notification> toUpdate;
        if (recipientId != null) {
            toUpdate = notificationRepository.findByRecipientIdAndIsReadFalse(recipientId);
        } else {
            toUpdate = notificationRepository.findAll();
        }

        toUpdate.forEach(n -> n.setIsRead(true));
        notificationRepository.saveAll(toUpdate);

        return ResponseEntity.ok(ApiResponse.success(
                "All notifications marked as read" + (recipientId != null ? " for user " + recipientId : ""),
                "Success",
                request.getRequestURI()
        ));
    }

    /**
     * DELETE /notifications/{id}
     * Permanently delete a single notification.
     */
    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> deleteNotification(
            @PathVariable Long id,
            HttpServletRequest request) {

        if (notificationRepository.existsById(id)) {
            notificationRepository.deleteById(id);
            return ResponseEntity.ok(ApiResponse.success(null, "Notification deleted successfully", request.getRequestURI()));
        }
        return ResponseEntity.notFound().build();
    }
}
