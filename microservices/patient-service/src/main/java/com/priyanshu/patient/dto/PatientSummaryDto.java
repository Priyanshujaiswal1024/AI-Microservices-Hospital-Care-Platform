package com.priyanshu.patient.dto;

import lombok.Data;

@Data
public class PatientSummaryDto {
    private Long id;
    private String name;
    private String email;
    private String phone;
}
