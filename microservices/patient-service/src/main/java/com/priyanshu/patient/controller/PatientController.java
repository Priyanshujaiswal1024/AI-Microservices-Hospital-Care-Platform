package com.priyanshu.patient.controller;

import com.priyanshu.patient.dto.*;
import com.priyanshu.patient.service.PatientService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/v1/patients")
@RequiredArgsConstructor
public class PatientController {

    private final PatientService patientService;

    @GetMapping("/profile")
    @PreAuthorize("hasRole('PATIENT')")
    public ResponseEntity<PatientResponseDto> getPatientProfile(@RequestAttribute("userId") Long userId) {
        return ResponseEntity.ok(patientService.getMyProfile(userId));
    }

    @PostMapping("/profile")
    @PreAuthorize("hasRole('PATIENT')")
    public ResponseEntity<PatientResponseDto> createPatientProfile(
            @RequestBody CreatePatientProfileRequestDto dto,
            @RequestAttribute("userId") Long userId) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(patientService.createPatientProfile(dto, userId));
    }

    @PutMapping("/profile")
    @PreAuthorize("hasRole('PATIENT')")
    public ResponseEntity<PatientResponseDto> updateProfile(
            @RequestBody UpdatePatientRequestDto dto,
            @RequestAttribute("userId") Long userId) {
        return ResponseEntity.ok(patientService.updatePatientProfile(dto, userId));
    }

    @PatchMapping("/profile")
    @PreAuthorize("hasRole('PATIENT')")
    public ResponseEntity<PatientResponseDto> patchProfile(
            @RequestBody UpdatePatientRequestDto dto,
            @RequestAttribute("userId") Long userId) {
        return ResponseEntity.ok(patientService.updatePatientProfile(dto, userId));
    }

    @PostMapping("/insurance")
    @PreAuthorize("hasRole('PATIENT')")
    public ResponseEntity<InsuranceResponseDto> addInsurance(
            @RequestBody CreateInsuranceRequestDto dto,
            @RequestAttribute("userId") Long userId) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(patientService.addInsurance(userId, dto));
    }

    @PutMapping("/insurance")
    @PreAuthorize("hasRole('PATIENT')")
    public ResponseEntity<InsuranceResponseDto> updateInsurance(
            @RequestBody CreateInsuranceRequestDto dto,
            @RequestAttribute("userId") Long userId) {
        return ResponseEntity.ok(patientService.addInsurance(userId, dto));
    }

    @GetMapping("/insurance")
    @PreAuthorize("hasRole('PATIENT')")
    public ResponseEntity<InsuranceResponseDto> getMyInsurance(@RequestAttribute("userId") Long userId) {
        return ResponseEntity.ok(patientService.getInsurance(userId));
    }

    @DeleteMapping("/insurance")
    @PreAuthorize("hasRole('PATIENT')")
    public ResponseEntity<Void> deleteMyInsurance(@RequestAttribute("userId") Long userId) {
        patientService.deleteInsurance(userId);
        return ResponseEntity.noContent().build();
    }

    // Called by Feign client in appointment-service
    @GetMapping("/{id}/summary")
    public ResponseEntity<PatientSummaryDto> getPatientSummary(@PathVariable Long id) {
        PatientResponseDto patient = patientService.getPatientByUserId(id);
        PatientSummaryDto summary = new PatientSummaryDto();
        summary.setId(patient.getId());
        summary.setName(patient.getName());
        summary.setEmail(patient.getEmail());
        summary.setPhone(patient.getPhone());
        return ResponseEntity.ok(summary);
    }

    @GetMapping("/{id}")
    public ResponseEntity<PatientResponseDto> getPatientById(@PathVariable Long id) {
        return ResponseEntity.ok(patientService.getPatientByUserId(id));
    }

    @GetMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<PatientResponseDto>> getAllPatients(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        return ResponseEntity.ok(patientService.getAllPatients(page, size));
    }

    // Called by Feign client in admin-service dashboard
    @GetMapping("/stats")
    public ResponseEntity<Map<String, Long>> getPatientStats() {
        Map<String, Long> stats = new HashMap<>();
        stats.put("totalPatients", patientService.getStatsCount());
        return ResponseEntity.ok(stats);
    }
}
