package com.priyanshu.doctor.entity;

import jakarta.persistence.*;
import lombok.*;

import java.util.ArrayList;
import java.util.HashSet;
import java.util.List;
import java.util.Set;

@Entity
@Table(name = "doctor")
@Getter @Setter @Builder @NoArgsConstructor @AllArgsConstructor
public class Doctor {

    @Id
    private Long id;           // Same as userId from auth-service

    @Column(nullable = false, length = 100)
    private String name;

    @Column(length = 100)
    private String specialization;

    @Column(unique = true, length = 100)
    private String email;

    @Column(nullable = false)
    private Double consultationFee;

    private Integer experienceYears;

    @Column(length = 15)
    private String phoneNumber;

    @Column(length = 255)
    private String profileImageUrl;

    @Column(length = 500)
    private String bio;

    @Builder.Default
    @ManyToMany(mappedBy = "doctors")
    private Set<Department> departments = new HashSet<>();

    @Builder.Default
    @OneToMany(mappedBy = "doctor", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<DoctorAvailability> availabilities = new ArrayList<>();
}
