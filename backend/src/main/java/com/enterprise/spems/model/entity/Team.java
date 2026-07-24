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
}
