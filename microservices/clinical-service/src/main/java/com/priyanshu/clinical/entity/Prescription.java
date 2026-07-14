package com.priyanshu.clinical.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;
import java.util.List;

@Entity
@Table(name = "prescription")
@Getter @Setter @Builder @NoArgsConstructor @AllArgsConstructor
public class Prescription {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    /** FK to appointment-service */
    @Column(nullable = false, unique = true)
    private Long appointmentId;

    private Long patientId;
    private Long doctorId;

    /** Denormalized */
    private String patientEmail;
    private String patientName;
    private String doctorName;

    private String diagnosis;

    @Column(length = 1000)
    private String notes;

    @OneToMany(mappedBy = "prescription", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<PrescriptionMedicine> medicines;

    @CreationTimestamp
    @Column(updatable = false)
    private LocalDateTime createdAt;
}
