package com.priyanshu.auth.dto;

import lombok.Data;

@Data
public class ResetPasswordRequestDto {
    private String email;
    private String otp;
    private String newPassword;
    private String confirmPassword;
}
