package com.enterprise.spems.model.entity;

import com.enterprise.spems.model.enums.PriorityLevel;
import com.enterprise.spems.model.enums.TaskStatus;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "tasks", indexes = {
        @Index(name = "idx_tasks_code", columnList = "task_code"),
        @Index(name = "idx_tasks_project_status", columnList = "project_id, status"),
        @Index(name = "idx_tasks_assignee_status", columnList = "assignee_id, status")
})
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Task {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "task_code", nullable = false, unique = true, length = 30)
    private String taskCode;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "project_id", nullable = false)
    private Project project;

    @Column(name = "title", nullable = false, length = 200)
    private String title;

    @Column(name = "description", columnDefinition = "TEXT")
    private String description;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "assignee_id")
    private Employee assignee;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "creator_id", nullable = false)
    private Employee creator;

    @Column(name = "estimated_hours")
    private Double estimatedHours;

    @Builder.Default
    @Column(name = "actual_hours")
    private Double actualHours = 0.0;

    @Enumerated(EnumType.STRING)
    @Builder.Default
    @Column(name = "priority", nullable = false, length = 20)
    private PriorityLevel priority = PriorityLevel.MEDIUM;

    @Enumerated(EnumType.STRING)
    @Builder.Default
    @Column(name = "status", nullable = false, length = 20)
    private TaskStatus status = TaskStatus.TODO;

    @Column(name = "due_date")
    private LocalDate dueDate;

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;
}
