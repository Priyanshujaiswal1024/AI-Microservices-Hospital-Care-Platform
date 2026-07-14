package com.priyanshu.clinical.entity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "prescription_medicine")
@Getter @Setter @Builder @NoArgsConstructor @AllArgsConstructor
public class PrescriptionMedicine {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "prescription_id", nullable = false)
    private Prescription prescription;

    /** FK to pharmacy-service (plain Long) */
    private Long medicineId;
    private String medicineName;    // snapshot so no cross-service call at read time

    private String frequency;       // e.g. "Twice daily"
    private Integer durationDays;
    private Integer quantity;
    private String instructions;
}
