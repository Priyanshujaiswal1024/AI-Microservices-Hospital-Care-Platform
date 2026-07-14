package com.priyanshu.pharmacy.controller;

import com.priyanshu.pharmacy.dto.MedicineRequestDto;
import com.priyanshu.pharmacy.dto.MedicineResponseDto;
import com.priyanshu.pharmacy.service.MedicineService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/v1/medicines")
@RequiredArgsConstructor
public class MedicineController {

    private final MedicineService medicineService;

    /** GET /api/v1/medicines?page=0&size=20 — all roles can view */
    @GetMapping
    public ResponseEntity<List<MedicineResponseDto>> getAllMedicines(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        return ResponseEntity.ok(medicineService.getAllMedicines(page, size));
    }

    /** GET /api/v1/medicines/{id} */
    @GetMapping("/{id}")
    public ResponseEntity<MedicineResponseDto> getMedicineById(@PathVariable Long id) {
        return ResponseEntity.ok(medicineService.getMedicineById(id));
    }

    /** GET /api/v1/medicines/search?name=... */
    @GetMapping("/search")
    public ResponseEntity<List<MedicineResponseDto>> searchByName(@RequestParam String name) {
        return ResponseEntity.ok(medicineService.searchByName(name));
    }

    /** GET /api/v1/medicines/low-stock — ADMIN only */
    @GetMapping("/low-stock")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<MedicineResponseDto>> getLowStockMedicines() {
        return ResponseEntity.ok(medicineService.getLowStockMedicines());
    }

    /** GET /api/v1/medicines/stats — ADMIN only */
    @GetMapping("/stats")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Map<String, Long>> getStats() {
        return ResponseEntity.ok(medicineService.getStats());
    }

    /** POST /api/v1/medicines — ADMIN only */
    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<MedicineResponseDto> createMedicine(
            @Valid @RequestBody MedicineRequestDto dto) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(medicineService.createMedicine(dto));
    }

    /** PUT /api/v1/medicines/{id} — ADMIN only */
    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<MedicineResponseDto> updateMedicine(
            @PathVariable Long id,
            @Valid @RequestBody MedicineRequestDto dto) {
        return ResponseEntity.ok(medicineService.updateMedicine(id, dto));
    }

    @RequestMapping(value = "/{id}/deduct", method = {RequestMethod.PUT, RequestMethod.PATCH})
    @PreAuthorize("hasAnyRole('DOCTOR','ADMIN')")
    public ResponseEntity<MedicineResponseDto> deductStock(
            @PathVariable Long id,
            @RequestParam int quantity) {
        return ResponseEntity.ok(medicineService.deductStock(id, quantity));
    }

    /** DELETE /api/v1/medicines/{id} — ADMIN only */
    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Void> deleteMedicine(@PathVariable Long id) {
        medicineService.deleteMedicine(id);
        return ResponseEntity.noContent().build();
    }
}
