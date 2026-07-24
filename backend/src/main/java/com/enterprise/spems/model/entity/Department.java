package com.enterprise.spems.model.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;

@Entity
@Table(name = "departments")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Department {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "name", nullable = false, unique = true, length = 100)
    private String name;

    @Column(name = "code", nullable = false, unique = true, length = 20)
    private String code;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "hod_id")
    @com.fasterxml.jackson.annotation.JsonIgnoreProperties({ "hibernateLazyInitializer", "handler", "user",
            "department" })
    private Employee headOfDepartment;

    @Column(name = "description", columnDefinition = "TEXT")
    private String description;

    @Column(name = "budget")
    private java.math.BigDecimal budget;

    @Column(name = "location", length = 150)
    private String location;

    @Column(name = "status", length = 20)
    @Builder.Default
    private String status = "ACTIVE";

    @Column(name = "business_unit", length = 100)
    private String businessUnit;

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;
}
