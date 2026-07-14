package com.priyanshu.notification.dto;

import lombok.Data;

@Data
public class OtpRequest {
    private String email;
    private String otp;
    private String purpose;
}
