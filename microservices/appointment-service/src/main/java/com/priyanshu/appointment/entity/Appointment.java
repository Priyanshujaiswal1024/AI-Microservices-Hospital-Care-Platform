package com.priyanshu.appointment.entity;

import com.priyanshu.appointment.entity.type.AppointmentStatus;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;

/**
 * Cross-service references are stored as plain IDs (no JPA joins).
 * doctorId → doctor-service
 * patientId → patient-service
 *
 * Snapshot fields (name, email) are stored here to avoid cross-service
 * calls when building email notifications.
 */
@Entity
@Table(name = "appointment")
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Appointment {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private Long patientId;         // FK to patient-service

    @Column(nullable = false)
    private Long doctorId;          // FK to doctor-service

    // ── Snapshot fields (denormalized for speed) ─────────────────────────────
    private String patientName;
    private String patientEmail;
    private String doctorName;
    private Double consultationFee; // snapshot so billing can act without calling doctor-service

    @Column(nullable = false)
    private LocalDateTime appointmentTime;

    @Column(length = 500)
    private String reason;

    @Enumerated(EnumType.STRING)
    @Builder.Default
    private AppointmentStatus status = AppointmentStatus.BOOKED;

    @CreationTimestamp
    @Column(updatable = false)
    private LocalDateTime createdAt;
}
