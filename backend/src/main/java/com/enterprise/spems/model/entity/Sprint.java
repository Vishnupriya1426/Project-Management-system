package com.enterprise.spems.model.entity;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;

@Entity
@Table(name = "sprints")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
public class Sprint {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "sprint_name", nullable = false, length = 150)
    private String sprintName;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "project_id", nullable = false)
    @JsonIgnoreProperties({"hibernateLazyInitializer", "handler", "client", "projectManager", "team"})
    private Project project;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "team_id")
    @JsonIgnoreProperties({"hibernateLazyInitializer", "handler", "department", "project", "teamLead", "scrumMaster"})
    private Team team;

    @Column(name = "start_date", length = 50)
    private String startDate;

    @Column(name = "end_date", length = 50)
    private String endDate;

    @Column(name = "goal", columnDefinition = "TEXT")
    private String goal;

    @Column(name = "capacity_hours")
    @Builder.Default
    private Integer capacityHours = 80;

    @Column(name = "story_points")
    @Builder.Default
    private Integer storyPoints = 40;

    @Column(name = "completed_points")
    @Builder.Default
    private Integer completedPoints = 0;

    @Column(name = "status", length = 30)
    @Builder.Default
    private String status = "PLANNING";

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    // Explicit Getters and Setters for compilation safety
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getSprintName() { return sprintName; }
    public void setSprintName(String sprintName) { this.sprintName = sprintName; }

    public Project getProject() { return project; }
    public void setProject(Project project) { this.project = project; }

    public Team getTeam() { return team; }
    public void setTeam(Team team) { this.team = team; }

    public String getStartDate() { return startDate; }
    public void setStartDate(String startDate) { this.startDate = startDate; }

    public String getEndDate() { return endDate; }
    public void setEndDate(String endDate) { this.endDate = endDate; }

    public String getGoal() { return goal; }
    public void setGoal(String goal) { this.goal = goal; }

    public Integer getCapacityHours() { return capacityHours; }
    public void setCapacityHours(Integer capacityHours) { this.capacityHours = capacityHours; }

    public Integer getStoryPoints() { return storyPoints; }
    public void setStoryPoints(Integer storyPoints) { this.storyPoints = storyPoints; }

    public Integer getCompletedPoints() { return completedPoints; }
    public void setCompletedPoints(Integer completedPoints) { this.completedPoints = completedPoints; }

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
}
