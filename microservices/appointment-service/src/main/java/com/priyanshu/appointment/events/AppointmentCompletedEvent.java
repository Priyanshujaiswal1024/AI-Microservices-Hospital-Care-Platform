package com.priyanshu.appointment.events;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * Kafka Topic: appointment.completed
 * → consumed by billing-service → auto-generates bill
 * → consumed by clinical-service → prompts doctor for prescription
 */
@Data @Builder @NoArgsConstructor @AllArgsConstructor
public class AppointmentCompletedEvent {
    private Long appointmentId;
    private Long patientId;
    private Long doctorId;
    private String patientName;
    private String patientEmail;
    private String doctorName;
    private Double consultationFee;
}
