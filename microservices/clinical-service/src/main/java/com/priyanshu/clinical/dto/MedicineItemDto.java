package com.priyanshu.clinical.dto;

import lombok.Data;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;

@Data
@JsonIgnoreProperties(ignoreUnknown = true)
public class MedicineItemDto {
    private Long medicineId;
    private String frequency;
    private Integer durationDays;
    private String instructions;
    private Integer quantity;
}
