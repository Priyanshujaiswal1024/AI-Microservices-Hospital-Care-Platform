package com.priyanshu.auth.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
public class SignUpRequestDto {
    @Email @NotBlank
    private String username;
    @NotBlank @Size(min = 6)
    private String password;
    @Size(min = 3, max = 60)
    private String fullName;
    @Pattern(regexp = "^[6-9]\\d{9}$")
    private String phone;
}
