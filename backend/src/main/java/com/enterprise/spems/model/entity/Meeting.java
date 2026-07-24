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
}
