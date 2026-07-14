package com.priyanshu.clinical.controller;

import com.priyanshu.clinical.dto.CreateMedicalRecordRequestDto;
import com.priyanshu.clinical.dto.MedicalRecordResponseDto;
import com.priyanshu.clinical.service.MedicalRecordService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/medical-records")
@RequiredArgsConstructor
public class MedicalRecordController {

    private final MedicalRecordService medicalRecordService;

    @GetMapping("/appointment/{appointmentId}")
    @PreAuthorize("hasAnyRole('PATIENT', 'DOCTOR', 'ADMIN')")
    public ResponseEntity<MedicalRecordResponseDto> getMedicalRecordByAppointmentId(@PathVariable Long appointmentId) {
        MedicalRecordResponseDto record = medicalRecordService.getMedicalRecordByAppointmentId(appointmentId);
        if (record == null) {
            return ResponseEntity.noContent().build();
        }
        return ResponseEntity.ok(record);
    }

    @PostMapping
    @PreAuthorize("hasAnyRole('DOCTOR', 'ADMIN')")
    public ResponseEntity<MedicalRecordResponseDto> createMedicalRecord(
            @Valid @RequestBody CreateMedicalRecordRequestDto dto) {
        return ResponseEntity.ok(medicalRecordService.createMedicalRecord(dto));
    }

    @GetMapping("/my")
    @PreAuthorize("hasRole('PATIENT')")
    public ResponseEntity<List<MedicalRecordResponseDto>> getMyMedicalRecords(
            @RequestAttribute("userId") Long userId) {
        return ResponseEntity.ok(medicalRecordService.getMedicalRecordsForLoggedInPatient(userId));
    }

    @GetMapping("/{id}/download")
    @PreAuthorize("hasAnyRole('PATIENT', 'DOCTOR', 'ADMIN')")
    public ResponseEntity<byte[]> downloadMedicalRecord(
            @PathVariable Long id,
            @RequestAttribute("userId") Long userId) throws Exception {
        byte[] pdf = medicalRecordService.downloadMedicalRecordPdf(id, userId);
        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"medical-record-" + id + ".pdf\"")
                .contentType(MediaType.APPLICATION_PDF)
                .body(pdf);
    }
}
