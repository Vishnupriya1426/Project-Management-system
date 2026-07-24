package com.enterprise.spems.model.entity;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;

@Entity
@Table(name = "meetings")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
public class Meeting {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "title", nullable = false, length = 200)
    private String title;

    @Column(name = "meeting_type", length = 50)
    @Builder.Default
    private String meetingType = "Sprint Planning";

    @Column(name = "visibility_scope", length = 50)
    @Builder.Default
    private String visibilityScope = "PROJECT_TEAM";

    @Column(name = "target_role", length = 50)
    private String targetRole;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "project_id")
    private Project project;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "team_id")
    private Team team;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "client_id")
    private Client client;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "department_id")
    private Department department;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "organizer_id")
    private User organizer;

    @Column(name = "meeting_date")
    private String meetingDate;

    @Column(name = "start_time")
    private String startTime;

    @Column(name = "end_time")
    private String endTime;

    @Column(name = "duration_minutes")
    @Builder.Default
    private Integer durationMinutes = 60;

    @Column(name = "meeting_link", length = 500)
    private String meetingLink;

    @Column(name = "location_type", length = 30)
    @Builder.Default
    private String locationType = "Online";

    @Column(name = "building_room", length = 200)
    private String buildingRoom;

    @Column(name = "agenda", columnDefinition = "TEXT")
    private String agenda;

    @Column(name = "status", length = 30)
    @Builder.Default
    private String status = "SCHEDULED";

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    // Explicit Getters and Setters for compilation safety
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }

    public String getMeetingType() { return meetingType; }
    public void setMeetingType(String meetingType) { this.meetingType = meetingType; }

    public String getVisibilityScope() { return visibilityScope; }
    public void setVisibilityScope(String visibilityScope) { this.visibilityScope = visibilityScope; }

    public String getTargetRole() { return targetRole; }
    public void setTargetRole(String targetRole) { this.targetRole = targetRole; }

    public Project getProject() { return project; }
    public void setProject(Project project) { this.project = project; }

    public Team getTeam() { return team; }
    public void setTeam(Team team) { this.team = team; }

    public Client getClient() { return client; }
    public void setClient(Client client) { this.client = client; }

    public Department getDepartment() { return department; }
    public void setDepartment(Department department) { this.department = department; }

    public User getOrganizer() { return organizer; }
    public void setOrganizer(User organizer) { this.organizer = organizer; }

    public String getMeetingDate() { return meetingDate; }
    public void setMeetingDate(String meetingDate) { this.meetingDate = meetingDate; }

    public String getStartTime() { return startTime; }
    public void setStartTime(String startTime) { this.startTime = startTime; }

    public String getEndTime() { return endTime; }
    public void setEndTime(String endTime) { this.endTime = endTime; }

    public Integer getDurationMinutes() { return durationMinutes; }
    public void setDurationMinutes(Integer durationMinutes) { this.durationMinutes = durationMinutes; }

    public String getMeetingLink() { return meetingLink; }
    public void setMeetingLink(String meetingLink) { this.meetingLink = meetingLink; }

    public String getLocationType() { return locationType; }
    public void setLocationType(String locationType) { this.locationType = locationType; }

    public String getBuildingRoom() { return buildingRoom; }
    public void setBuildingRoom(String buildingRoom) { this.buildingRoom = buildingRoom; }

    public String getAgenda() { return agenda; }
    public void setAgenda(String agenda) { this.agenda = agenda; }

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
}
