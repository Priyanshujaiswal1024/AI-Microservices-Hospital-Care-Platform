package com.priyanshu.doctor.dto;

import lombok.Data;

@Data
public class AddDoctorToDepartmentDto {
    private Long departmentId;
    private Long doctorId;
}
