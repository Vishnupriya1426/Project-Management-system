package com.enterprise.spems.model.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "project_proposals")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ProjectProposal {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // Step 1 - Client & Company Information
    @Column(name = "client_organization", length = 150)
    private String clientOrganization;

    @Column(name = "contact_person", length = 100)
    private String contactPerson;

    @Column(name = "contact_email", length = 100)
    private String contactEmail;

    @Column(name = "contact_phone", length = 30)
    private String contactPhone;

    @Column(name = "industry", length = 100)
    private String industry;

    @Column(name = "company_size", length = 50)
    private String companySize;

    @Column(name = "company_address", columnDefinition = "TEXT")
    private String companyAddress;

    @Column(name = "country", length = 100)
    private String country;

    @Column(name = "time_zone", length = 50)
    private String timeZone;

    // Step 2 – Project Overview
    @Column(name = "title", nullable = false, length = 200)
    private String title;

    @Column(name = "project_type", length = 100)
    private String projectType;

    @Column(name = "business_objective", columnDefinition = "TEXT")
    private String businessObjective;

    @Column(name = "description", columnDefinition = "TEXT")
    private String description;

    @Column(name = "business_problem", columnDefinition = "TEXT")
    private String businessProblem;

    @Column(name = "expected_outcome", columnDefinition = "TEXT")
    private String expectedOutcome;

    @Column(name = "priority", length = 30)
    private String priority;

    @Column(name = "is_confidential")
    private Boolean isConfidential;

    // Step 3 – Budget & Timeline
    @Column(name = "estimated_budget", length = 50)
    private String estimatedBudget;

    @Column(name = "currency", length = 10)
    private String currency;

    @Column(name = "expected_start_date", length = 30)
    private String expectedStartDate;

    @Column(name = "expected_end_date", length = 30)
    private String expectedEndDate;

    @Column(name = "required_go_live_date", length = 30)
    private String requiredGoLiveDate;

    @Column(name = "estimated_duration", length = 50)
    private String estimatedDuration;

    @Column(name = "billing_model", length = 50)
    private String billingModel;

    @Column(name = "payment_terms", length = 100)
    private String paymentTerms;

    // Step 4 – Technical Requirements
    @Column(name = "technology_stack", length = 255)
    private String technologyStack;

    @Column(name = "platform", length = 100)
    private String platform;

    @Column(name = "integrations_required", columnDefinition = "TEXT")
    private String integrationsRequired;

    @Column(name = "security_requirements", columnDefinition = "TEXT")
    private String securityRequirements;

    @Column(name = "compliance_requirements", columnDefinition = "TEXT")
    private String complianceRequirements;

    @Column(name = "expected_users_count", length = 50)
    private String expectedUsersCount;

    @Column(name = "hosting_preference", length = 100)
    private String hostingPreference;

    @Column(name = "required_features_checklist", columnDefinition = "TEXT")
    private String requiredFeaturesChecklist;

    // Step 5 – Documents & Approvals
    @Column(name = "rfp_file_name", length = 255)
    private String rfpFileName;

    @Column(name = "brd_file_name", length = 255)
    private String brdFileName;

    @Column(name = "sow_file_name", length = 255)
    private String sowFileName;

    @Column(name = "architecture_diagram_file_name", length = 255)
    private String architectureDiagramFileName;

    @Column(name = "sample_data_file_name", length = 255)
    private String sampleDataFileName;

    @Column(name = "additional_notes", columnDefinition = "TEXT")
    private String additionalNotes;

    @Column(name = "terms_accepted")
    private Boolean termsAccepted;

    // Metadata & Workflow Status
    @Column(name = "status", length = 30)
    private String status;

    @Column(name = "rejection_reason", columnDefinition = "TEXT")
    private String rejectionReason;

    @Column(name = "created_at")
    private LocalDateTime createdAt;

    @PrePersist
    protected void onCreate() {
        if (this.createdAt == null) {
            this.createdAt = LocalDateTime.now();
        }
        if (this.status == null) {
            this.status = "PENDING_REVIEW";
        }
    }
}
