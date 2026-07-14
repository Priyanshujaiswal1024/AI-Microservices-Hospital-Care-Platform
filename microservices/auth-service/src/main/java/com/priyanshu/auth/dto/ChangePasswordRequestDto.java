package com.priyanshu.auth.dto;

import lombok.Data;

@Data
public class ChangePasswordRequestDto {
    private String oldPassword;
    private String newPassword;
    private String confirmPassword;
}
