package com.enterprise.spems.model.entity;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;

@Entity
@Table(name = "tasks")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
public class Task {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "task_code", length = 50)
    private String taskCode;

    @Column(name = "title", nullable = false, length = 200)
    private String title;

    @Column(name = "description", columnDefinition = "TEXT")
    private String description;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "project_id")
    @JsonIgnoreProperties({"hibernateLazyInitializer", "handler", "client", "projectManager", "team"})
    private Project project;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "team_id")
    @JsonIgnoreProperties({"hibernateLazyInitializer", "handler", "department", "project", "teamLead", "scrumMaster"})
    private Team team;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "sprint_id")
    @JsonIgnoreProperties({"hibernateLazyInitializer", "handler", "project", "team"})
    private Sprint sprint;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "department_id")
    @JsonIgnoreProperties({"hibernateLazyInitializer", "handler", "manager"})
    private Department department;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "assignee_id")
    @JsonIgnoreProperties({"hibernateLazyInitializer", "handler", "user", "department"})
    private Employee assignee;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "creator_id")
    @JsonIgnoreProperties({"hibernateLazyInitializer", "handler", "user", "department"})
    private Employee creator;

    @Column(name = "priority", length = 30)
    @Builder.Default
    private String priority = "MEDIUM";

    @Column(name = "status", length = 30)
    @Builder.Default
    private String status = "TODO";

    @Column(name = "progress_percentage")
    @Builder.Default
    private Integer progressPercentage = 0;

    @Column(name = "estimated_hours")
    @Builder.Default
    private Double estimatedHours = 8.0;

    @Column(name = "actual_hours")
    @Builder.Default
    private Double actualHours = 0.0;

    @Column(name = "story_points")
    @Builder.Default
    private Integer storyPoints = 5;

    @Column(name = "due_date", length = 50)
    private String dueDate;

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    // Explicit Getters and Setters for compilation safety
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getTaskCode() { return taskCode; }
    public void setTaskCode(String taskCode) { this.taskCode = taskCode; }

    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }

    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }

    public Project getProject() { return project; }
    public void setProject(Project project) { this.project = project; }

    public Team getTeam() { return team; }
    public void setTeam(Team team) { this.team = team; }

    public Sprint getSprint() { return sprint; }
    public void setSprint(Sprint sprint) { this.sprint = sprint; }

    public Department getDepartment() { return department; }
    public void setDepartment(Department department) { this.department = department; }

    public Employee getAssignee() { return assignee; }
    public void setAssignee(Employee assignee) { this.assignee = assignee; }

    public Employee getCreator() { return creator; }
    public void setCreator(Employee creator) { this.creator = creator; }

    public String getPriority() { return priority; }
    public void setPriority(String priority) { this.priority = priority; }

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }

    public Integer getProgressPercentage() { return progressPercentage; }
    public void setProgressPercentage(Integer progressPercentage) { this.progressPercentage = progressPercentage; }

    public Double getEstimatedHours() { return estimatedHours; }
    public void setEstimatedHours(Double estimatedHours) { this.estimatedHours = estimatedHours; }

    public Double getActualHours() { return actualHours; }
    public void setActualHours(Double actualHours) { this.actualHours = actualHours; }

    public Integer getStoryPoints() { return storyPoints; }
    public void setStoryPoints(Integer storyPoints) { this.storyPoints = storyPoints; }

    public String getDueDate() { return dueDate; }
    public void setDueDate(String dueDate) { this.dueDate = dueDate; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
}
