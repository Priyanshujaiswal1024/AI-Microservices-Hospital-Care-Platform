package com.priyanshu.pharmacy.dto;

import com.priyanshu.pharmacy.entity.type.MedicineType;
import lombok.Data;

@Data
public class MedicineResponseDto {
    private Long id;
    private String name;
    private String category;
    private MedicineType type;
    private String dosage;
    private String manufacturer;
    private Double price;
    private Integer stock;
    private boolean lowStock;
}
