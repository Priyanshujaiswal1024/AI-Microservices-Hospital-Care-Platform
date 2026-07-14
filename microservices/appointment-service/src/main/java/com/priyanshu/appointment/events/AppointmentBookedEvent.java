package com.priyanshu.appointment.events;

import com.fasterxml.jackson.annotation.JsonFormat;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

/** Kafka Topic: appointment.booked → consumed by notification-service */
@Data @Builder @NoArgsConstructor @AllArgsConstructor
public class AppointmentBookedEvent {
    private Long appointmentId;
    private String patientEmail;
    private String patientName;
    private String doctorName;
    @JsonFormat(shape = JsonFormat.Shape.STRING, pattern = "yyyy-MM-dd'T'HH:mm:ss")
    private LocalDateTime appointmentTime;
    private String reason;
}
