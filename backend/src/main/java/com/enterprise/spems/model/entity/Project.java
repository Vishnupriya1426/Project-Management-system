package com.enterprise.spems.model.entity;

import com.enterprise.spems.model.enums.PriorityLevel;
import com.enterprise.spems.model.enums.ProjectStatus;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "projects", indexes = {
        @Index(name = "idx_projects_code", columnList = "project_code"),
        @Index(name = "idx_projects_pm_status", columnList = "project_manager_id, status")
})
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
public class Project {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "project_code", nullable = false, unique = true, length = 30)
    private String projectCode;

    @Column(name = "title", nullable = false, length = 200)
    private String title;

    @Column(name = "description", columnDefinition = "TEXT")
    private String description;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "client_id")
    @JsonIgnoreProperties({"hibernateLazyInitializer", "handler", "user"})
    private Client client;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "project_manager_id")
    @JsonIgnoreProperties({"hibernateLazyInitializer", "handler", "user"})
    private Employee projectManager;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "team_id")
    @JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
    private Team team;

    @Column(name = "budget", precision = 15, scale = 2)
    private BigDecimal budget;

    @Column(name = "tech_stack", length = 500)
    private String techStack;

    @Column(name = "start_date")
    private LocalDate startDate;

    @Column(name = "end_date")
    private LocalDate endDate;

    @Enumerated(EnumType.STRING)
    @Builder.Default
    @Column(name = "priority", nullable = false, length = 20)
    private PriorityLevel priority = PriorityLevel.MEDIUM;

    @Enumerated(EnumType.STRING)
    @Builder.Default
    @Column(name = "status", nullable = false, length = 20)
    private ProjectStatus status = ProjectStatus.PLANNED;

    @Builder.Default
    @Column(name = "progress_percentage", nullable = false)
    private Double progressPercentage = 0.0;

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;
}
