package com.priyanshu.appointment.dto.notification;

import com.fasterxml.jackson.annotation.JsonFormat;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

/** Used for SYNC FALLBACK when Kafka is unavailable */
@Data @NoArgsConstructor @AllArgsConstructor
public class EmailBookingRequest {
    private String patientEmail;
    private String patientName;
    private String doctorName;
    @JsonFormat(shape = JsonFormat.Shape.STRING, pattern = "yyyy-MM-dd'T'HH:mm:ss")
    private LocalDateTime appointmentTime;
    private String reason;
}
