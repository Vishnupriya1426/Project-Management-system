package com.enterprise.spems.model.entity;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;

@Entity
@Table(name = "teams")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
public class Team {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "name", nullable = false, length = 100)
    private String name;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "department_id")
    @JsonIgnoreProperties({"hibernateLazyInitializer", "handler", "headOfDepartment"})
    private Department department;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "project_id")
    @JsonIgnoreProperties({"hibernateLazyInitializer", "handler", "client", "projectManager", "team"})
    private Project project;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "team_lead_id")
    @JsonIgnoreProperties({"hibernateLazyInitializer", "handler", "user", "department"})
    private Employee teamLead;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "scrum_master_id")
    @JsonIgnoreProperties({"hibernateLazyInitializer", "handler", "user", "department"})
    private Employee scrumMaster;

    @Column(name = "member_count")
    @Builder.Default
    private Integer memberCount = 1;

    @Column(name = "target_size")
    @Builder.Default
    private Integer targetSize = 10;

    @Column(name = "deadline", length = 50)
    private String deadline;

    @Column(name = "prd_document", length = 255)
    private String prdDocument;

    @Column(name = "capacity_utilization")
    @Builder.Default
    private Integer capacityUtilization = 80;

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    // Explicit Getters and Setters for compilation safety
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public Department getDepartment() { return department; }
    public void setDepartment(Department department) { this.department = department; }

    public Project getProject() { return project; }
    public void setProject(Project project) { this.project = project; }

    public Employee getTeamLead() { return teamLead; }
    public void setTeamLead(Employee teamLead) { this.teamLead = teamLead; }

    public Employee getScrumMaster() { return scrumMaster; }
    public void setScrumMaster(Employee scrumMaster) { this.scrumMaster = scrumMaster; }

    public Integer getMemberCount() { return memberCount; }
    public void setMemberCount(Integer memberCount) { this.memberCount = memberCount; }

    public Integer getTargetSize() { return targetSize; }
    public void setTargetSize(Integer targetSize) { this.targetSize = targetSize; }

    public String getDeadline() { return deadline; }
    public void setDeadline(String deadline) { this.deadline = deadline; }

    public String getPrdDocument() { return prdDocument; }
    public void setPrdDocument(String prdDocument) { this.prdDocument = prdDocument; }

    public Integer getCapacityUtilization() { return capacityUtilization; }
    public void setCapacityUtilization(Integer capacityUtilization) { this.capacityUtilization = capacityUtilization; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
}
