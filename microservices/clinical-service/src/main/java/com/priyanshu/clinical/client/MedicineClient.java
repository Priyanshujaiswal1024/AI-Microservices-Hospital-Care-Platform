package com.priyanshu.clinical.client;

import lombok.Data;
import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.RequestParam;

@FeignClient(name = "pharmacy-service", url = "${pharmacy.service.url}")
public interface MedicineClient {

    @GetMapping("/api/v1/medicines/{id}")
    MedicineResponseDto getMedicineById(@PathVariable("id") Long id);

    @org.springframework.web.bind.annotation.PutMapping("/api/v1/medicines/{id}/deduct")
    MedicineResponseDto deductStock(
            @PathVariable(value = "id") Long id,
            @RequestParam("quantity") int quantity
    );

    @GetMapping("/api/v1/medicines/search")
    java.util.List<MedicineResponseDto> searchByName(@RequestParam("name") String name);

    @GetMapping("/api/v1/medicines")
    java.util.List<MedicineResponseDto> getAllMedicines();

    @Data
    @com.fasterxml.jackson.annotation.JsonIgnoreProperties(ignoreUnknown = true)
    class MedicineResponseDto {
        private Long id;
        private String name;
        private String category;
        private Double price;
        private Integer stock;
    }
}
