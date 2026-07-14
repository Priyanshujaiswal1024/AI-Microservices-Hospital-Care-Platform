package com.priyanshu.billing.events;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

/** Consumed from Kafka topic: appointment.completed */
@Data @NoArgsConstructor @AllArgsConstructor
@com.fasterxml.jackson.annotation.JsonIgnoreProperties(ignoreUnknown = true)
public class AppointmentCompletedEvent {
    private Long appointmentId;
    private Long patientId;
    private Long doctorId;
    private String patientName;
    private String patientEmail;
    private String doctorName;
    private Double consultationFee;
}
