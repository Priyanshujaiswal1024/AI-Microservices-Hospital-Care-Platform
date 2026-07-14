package com.priyanshu.patient.entity;

import com.priyanshu.patient.entity.type.BloodGroupType;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "patient")
@Getter @Setter @Builder @NoArgsConstructor @AllArgsConstructor
public class Patient {

    @Id
    private Long id;          // Same as userId from auth-service

    @Column(nullable = false, length = 40)
    private String name;

    /** email is obtained from auth-service via userId, stored as snapshot */
    private String email;

    private String phone;
    private String fatherName;
    private LocalDate birthDate;
    private String gender;

    @Column(length = 450)
    private String address;

    private String city;
    private String state;
    private String pincode;
    private String emergencyContactName;
    private String emergencyContactPhone;

    @Enumerated(EnumType.STRING)
    private BloodGroupType bloodGroup;

    private Double height;
    private Double weight;

    @CreationTimestamp
    @Column(updatable = false)
    private LocalDateTime createdAt;

    @OneToOne(mappedBy = "patient", cascade = CascadeType.ALL, orphanRemoval = true)
    private Insurance insurance;
}
