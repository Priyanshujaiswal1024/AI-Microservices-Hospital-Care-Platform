package com.priyanshu.notification.events;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * Published by auth-service when OTP is needed.
 * Kafka Topic: otp.send
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
@com.fasterxml.jackson.annotation.JsonIgnoreProperties(ignoreUnknown = true)
public class OtpSendEvent {
    private String email;
    private String otp;
    /** "SIGNUP", "FORGOT_PASSWORD", "RESEND" */
    private String purpose;
}
