package com.priyanshu.billing.entity;

import com.priyanshu.billing.entity.type.BillStatus;
import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "bill")
@Getter @Setter @Builder @NoArgsConstructor @AllArgsConstructor
public class Bill {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true)
    private Long appointmentId;     // FK to appointment-service (plain Long, no JPA join)

    private Long patientId;
    private Long doctorId;

    // Denormalized snapshots from appointment
    private String patientName;
    private String patientEmail;
    private String doctorName;

    private Double consultationFee;
    private Double gstAmount;       // 18% of consultationFee
    private Double totalAmount;     // consultationFee + gstAmount

    @Enumerated(EnumType.STRING)
    @Builder.Default
    private BillStatus status = BillStatus.UNPAID;

    private LocalDateTime createdAt;
    private LocalDateTime paidAt;
}
