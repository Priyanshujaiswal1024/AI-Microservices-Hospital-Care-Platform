package com.priyanshu.doctor.dto;

import lombok.Data;
import java.util.Set;

@Data
public class DepartmentResponseDto {
    private Long id;
    private String name;
    private String headDoctorName;
    private Set<String> doctorNames;
}
