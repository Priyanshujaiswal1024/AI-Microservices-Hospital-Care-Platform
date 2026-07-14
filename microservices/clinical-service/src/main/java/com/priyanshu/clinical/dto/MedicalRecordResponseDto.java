package com.priyanshu.clinical.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class MedicalRecordResponseDto {
    private Long id;
    private String diagnosis;
    private String notes;
    private Long patientId;
    private Long doctorId;
    private Long appointmentId;
    private String patientName;
    private String doctorName;
    private Long prescriptionId;
    private LocalDateTime visitDate;
}
