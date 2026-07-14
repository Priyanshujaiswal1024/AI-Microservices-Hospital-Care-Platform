package com.priyanshu.auth.events;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

/** Published to Kafka topic: otp.send */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class OtpSendEvent {
    private String email;
    private String otp;
    private String purpose; // SIGNUP | FORGOT_PASSWORD | RESEND
}
