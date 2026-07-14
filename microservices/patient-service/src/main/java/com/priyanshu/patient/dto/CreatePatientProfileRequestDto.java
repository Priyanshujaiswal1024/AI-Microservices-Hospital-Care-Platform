package com.priyanshu.patient.dto;

import com.priyanshu.patient.entity.type.BloodGroupType;
import lombok.Data;
import java.time.LocalDate;

@Data
public class CreatePatientProfileRequestDto {
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
}
