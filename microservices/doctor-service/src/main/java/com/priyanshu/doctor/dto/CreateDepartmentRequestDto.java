package com.priyanshu.doctor.dto;

import lombok.Data;

@Data
public class CreateDepartmentRequestDto {
    private String name;
    private Long headDoctorId;
}
