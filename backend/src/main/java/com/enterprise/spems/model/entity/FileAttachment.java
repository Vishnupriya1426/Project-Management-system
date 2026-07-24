package com.enterprise.spems.model.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;

@Entity
@Table(name = "file_attachments")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class FileAttachment {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "original_name", nullable = false)
    private String originalName;

    @Column(name = "file_key", nullable = false, unique = true)
    private String fileKey;

    @Column(name = "content_type", nullable = false, length = 100)
    private String contentType;

    @Column(name = "size_bytes", nullable = false)
    private Long sizeBytes;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "uploaded_by_id", nullable = false)
    private User uploadedBy;

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;
}
