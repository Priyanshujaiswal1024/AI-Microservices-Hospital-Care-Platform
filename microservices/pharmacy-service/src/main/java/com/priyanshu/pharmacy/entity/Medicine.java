package com.priyanshu.pharmacy.entity;

import com.priyanshu.pharmacy.entity.type.MedicineType;
import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "medicine")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Medicine {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String name;

    private String category;

    @Enumerated(EnumType.STRING)
    private MedicineType type;

    private String dosage;

    private String manufacturer;

    private Double price;

    private Integer stock;
}
