package com.enterprise.spems.model.entity;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;

@Entity
@Table(name = "milestones")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
public class Milestone {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "milestone_name", nullable = false, length = 150)
    private String milestoneName;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "project_id", nullable = false)
    @JsonIgnoreProperties({"hibernateLazyInitializer", "handler", "client", "projectManager", "team"})
    private Project project;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "owner_id")
    @JsonIgnoreProperties({"hibernateLazyInitializer", "handler", "user", "department"})
    private Employee owner;

    @Column(name = "due_date", length = 50)
    private String dueDate;

    @Column(name = "description", columnDefinition = "TEXT")
    private String description;

    @Column(name = "completion_pct")
    @Builder.Default
    private Integer completionPct = 0;

    @Column(name = "status", length = 30)
    @Builder.Default
    private String status = "IN_PROGRESS";

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    // Explicit Getters and Setters for compilation safety
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getMilestoneName() { return milestoneName; }
    public void setMilestoneName(String milestoneName) { this.milestoneName = milestoneName; }

    public Project getProject() { return project; }
    public void setProject(Project project) { this.project = project; }

    public Employee getOwner() { return owner; }
    public void setOwner(Employee owner) { this.owner = owner; }

    public String getDueDate() { return dueDate; }
    public void setDueDate(String dueDate) { this.dueDate = dueDate; }

    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }

    public Integer getCompletionPct() { return completionPct; }
    public void setCompletionPct(Integer completionPct) { this.completionPct = completionPct; }

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
}
