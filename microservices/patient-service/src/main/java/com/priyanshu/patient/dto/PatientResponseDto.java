package com.priyanshu.patient.dto;

import com.priyanshu.patient.entity.type.BloodGroupType;
import lombok.Data;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Data
public class PatientResponseDto {
    private Long id;
    private String name;
    private String fatherName;
    private LocalDate birthDate;
    private String email;
    private String phone;
    private String gender;
    private String address;
    private String city;
    private String state;
    private String pincode;
    private String emergencyContactName;
    private String emergencyContactPhone;
    private BloodGroupType bloodGroup;
    private Double height;
    private Double weight;
    private LocalDateTime createdAt;
    private InsuranceResponseDto insurance;
}
