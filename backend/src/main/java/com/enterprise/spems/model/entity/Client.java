package com.enterprise.spems.model.entity;

import jakarta.persistence.*;
import lombok.*;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;

@Entity
@Table(name = "clients")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
public class Client {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "company_name", nullable = false, length = 150)
    private String companyName;

    @Column(name = "contact_person", length = 100)
    private String contactPerson;

    @Column(name = "email", nullable = false, unique = true, length = 100)
    private String email;

    @Column(name = "phone", length = 20)
    private String phone;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", unique = true)
    private User user;
}
