package com.priyanshu.patient.dto;

import lombok.Data;

@Data
public class UpdatePatientRequestDto {
    private String phone;
    private String address;
    private String city;
    private String state;
    private String pincode;
    private String emergencyContactName;
    private String emergencyContactPhone;
    private Double height;
    private Double weight;
}
