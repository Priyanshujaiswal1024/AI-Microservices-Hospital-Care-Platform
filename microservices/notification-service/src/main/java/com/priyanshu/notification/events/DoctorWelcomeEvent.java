package com.priyanshu.notification.events;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * Published by auth-service / admin-service when a new doctor is onboarded.
 * Kafka Topic: doctor.welcome
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
@com.fasterxml.jackson.annotation.JsonIgnoreProperties(ignoreUnknown = true)
public class DoctorWelcomeEvent {
    private String doctorEmail;
    private String doctorName;
    private String tempPassword;
}
