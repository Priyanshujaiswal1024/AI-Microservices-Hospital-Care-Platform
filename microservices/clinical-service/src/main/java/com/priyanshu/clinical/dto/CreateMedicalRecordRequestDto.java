package com.priyanshu.clinical.dto;

import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class CreateMedicalRecordRequestDto {
    @NotNull(message = "Appointment ID is required")
    private Long appointmentId;
    private Long prescriptionId;
    @NotNull(message = "Diagnosis is required")
    private String diagnosis;
    private String notes;
}
