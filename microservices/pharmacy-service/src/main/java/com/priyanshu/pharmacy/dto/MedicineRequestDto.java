package com.priyanshu.pharmacy.dto;

import com.priyanshu.pharmacy.entity.type.MedicineType;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class MedicineRequestDto {
    @NotBlank
    private String name;
    private String category;
    private MedicineType type;
    private String dosage;
    private String manufacturer;
    @Min(0)
    private Double price;
    @Min(0)
    private Integer stock;
}
