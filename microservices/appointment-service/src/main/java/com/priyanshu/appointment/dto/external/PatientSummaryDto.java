package com.priyanshu.appointment.dto.external;

import lombok.Data;

/** Received from patient-service when fetching patient details */
@Data
public class PatientSummaryDto {
    private Long id;
    private String name;
    private String email;   // patient's login email
    private String phone;
}
