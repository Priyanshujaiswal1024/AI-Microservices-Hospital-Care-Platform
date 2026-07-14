package com.priyanshu.clinical.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDateTime;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PrescriptionResponseDto {
    private Long id;
    private String diagnosis;
    private String notes;
    private List<PrescriptionMedicineResponseDto> medicines;
    private Long appointmentId;
    private LocalDateTime createdAt;
}
