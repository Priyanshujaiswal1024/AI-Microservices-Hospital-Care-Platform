package com.priyanshu.clinical.dto;

import lombok.Data;
import java.util.List;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;

@Data
@JsonIgnoreProperties(ignoreUnknown = true)
public class CreatePrescriptionRequestDto {
    private String diagnosis;
    private String notes;
    private List<MedicineItemDto> medicines;
}
