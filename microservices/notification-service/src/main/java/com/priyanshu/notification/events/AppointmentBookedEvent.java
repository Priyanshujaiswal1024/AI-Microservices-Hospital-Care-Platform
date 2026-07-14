package com.priyanshu.notification.events;

import com.fasterxml.jackson.annotation.JsonFormat;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

/**
 * Published by appointment-service when a new appointment is booked.
 * Consumed by notification-service → sends booking confirmation email.
 * Kafka Topic: appointment.booked
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
@com.fasterxml.jackson.annotation.JsonIgnoreProperties(ignoreUnknown = true)
public class AppointmentBookedEvent {
    private Long appointmentId;
    private String patientEmail;
    private String patientName;
    private String doctorName;
    @JsonFormat(shape = JsonFormat.Shape.STRING, pattern = "yyyy-MM-dd'T'HH:mm:ss")
    private LocalDateTime appointmentTime;
    private String reason;
}
