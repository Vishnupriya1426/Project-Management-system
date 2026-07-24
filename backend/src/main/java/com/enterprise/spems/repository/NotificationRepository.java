package com.enterprise.spems.repository;

import com.enterprise.spems.model.entity.Notification;
import com.enterprise.spems.model.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface NotificationRepository extends JpaRepository<Notification, Long> {
    List<Notification> findByRecipientOrderByCreatedAtDesc(User recipient);
    List<Notification> findByRecipientIdOrderByCreatedAtDesc(Long recipientId);
}
