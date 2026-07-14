package com.priyanshu.appointment.dto.external;

import lombok.Data;

/** Received from doctor-service when fetching doctor details */
@Data
public class DoctorSummaryDto {
    private Long id;
    private String name;
    private String email;
    private String specialization;
    private Double consultationFee;
}
