package com.priyanshu.clinical.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "medical_record")
@Getter @Setter @Builder @NoArgsConstructor @AllArgsConstructor
public class MedicalRecord {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private Long patientId;
    private Long doctorId;
    private Long appointmentId;
    private Long prescriptionId;

    /** Denormalized */
    private String patientName;
    private String doctorName;

    private String diagnosis;

    @Column(length = 1000)
    private String notes;

    private LocalDateTime visitDate;
}
