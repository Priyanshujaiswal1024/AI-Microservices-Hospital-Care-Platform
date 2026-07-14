package com.priyanshu.doctor.dto;

import lombok.Data;

@Data
public class CreateDoctorRequestDto {

    private String username;        // email used as login
    private String password;
    private String name;
    private String email;
    private Double consultationFee;
    private String specialization;
    private Long departmentId;
    private Integer experienceYears;
    private String phoneNumber;
    private String bio;
    private String profileImageUrl;
}
