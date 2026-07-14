package com.priyanshu.doctor.controller;

import com.priyanshu.doctor.dto.CreateDoctorRequestDto;
import com.priyanshu.doctor.dto.DoctorAvailabilityRequestDto;
import com.priyanshu.doctor.dto.DoctorAvailabilityResponseDto;
import com.priyanshu.doctor.dto.DoctorResponseDto;
import com.priyanshu.doctor.service.DoctorService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/v1/doctors")
@RequiredArgsConstructor
public class DoctorController {

    private final DoctorService doctorService;

    @GetMapping
    public ResponseEntity<Page<DoctorResponseDto>> getAllDoctors(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        return ResponseEntity.ok(doctorService.getAllDoctors(page, size));
    }

    @GetMapping("/{id}")
    public ResponseEntity<DoctorResponseDto> getDoctorById(@PathVariable Long id) {
        return ResponseEntity.ok(doctorService.getDoctorById(id));
    }

    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<DoctorResponseDto> onboardDoctor(@RequestBody CreateDoctorRequestDto dto) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(doctorService.onBoardNewDoctor(dto));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<DoctorResponseDto> updateDoctor(
            @PathVariable Long id,
            @RequestBody CreateDoctorRequestDto dto) {
        return ResponseEntity.ok(doctorService.updateDoctor(id, dto));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Void> deleteDoctor(@PathVariable Long id) {
        doctorService.deleteDoctor(id);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/search")
    public ResponseEntity<Page<DoctorResponseDto>> searchDoctors(
            @RequestParam(required = false) String name,
            @RequestParam(required = false) String specialization,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        return ResponseEntity.ok(doctorService.searchDoctors(name, specialization, page, size));
    }

    @GetMapping("/profile")
    @PreAuthorize("hasRole('DOCTOR')")
    public ResponseEntity<DoctorResponseDto> getMyProfile(
            @RequestAttribute("userId") Long userId) {
        return ResponseEntity.ok(doctorService.getDoctorById(userId));
    }

    @GetMapping("/availability")
    @PreAuthorize("hasRole('DOCTOR')")
    public ResponseEntity<List<DoctorAvailabilityResponseDto>> getMyAvailability(
            @RequestAttribute("userId") Long userId) {
        return ResponseEntity.ok(doctorService.getMyAvailability(userId));
    }

    @PostMapping("/availability")
    @PreAuthorize("hasRole('DOCTOR')")
    public ResponseEntity<String> addAvailability(
            @RequestBody DoctorAvailabilityRequestDto dto,
            @RequestAttribute("userId") Long userId) {
        doctorService.addDoctorAvailability(userId, dto);
        return ResponseEntity.ok("Availability added successfully");
    }

    // Called by Feign client in appointment-service
    @GetMapping("/{id}/summary")
    public ResponseEntity<Map<String, Object>> getDoctorSummary(@PathVariable Long id) {
        DoctorResponseDto doctor = doctorService.getDoctorById(id);
        Map<String, Object> summary = new HashMap<>();
        summary.put("id", doctor.getId());
        summary.put("name", doctor.getName());
        summary.put("email", doctor.getEmail());
        summary.put("phone", doctor.getPhoneNumber());
        return ResponseEntity.ok(summary);
    }

    // Called by Feign client in appointment-service
    @GetMapping("/{id}/availability")
    public ResponseEntity<Boolean> isDoctorAvailableOnDate(
            @PathVariable Long id,
            @RequestParam("date") String date) {
        LocalDate localDate = LocalDate.parse(date);
        return ResponseEntity.ok(doctorService.isDoctorAvailableOnDate(id, localDate));
    }

    @GetMapping("/{id}/slots")
    public ResponseEntity<DoctorAvailabilityResponseDto> getAvailabilityByDate(
            @PathVariable Long id,
            @RequestParam("date") String date) {
        LocalDate localDate = LocalDate.parse(date);
        return ResponseEntity.ok(doctorService.getAvailabilityByDate(id, localDate));
    }

    // Called by Feign client in admin-service dashboard
    @GetMapping("/stats")
    public ResponseEntity<Map<String, Long>> getDoctorStats() {
        Map<String, Long> stats = new HashMap<>();
        stats.put("totalDoctors", doctorService.getStatsCount());
        return ResponseEntity.ok(stats);
    }
}
