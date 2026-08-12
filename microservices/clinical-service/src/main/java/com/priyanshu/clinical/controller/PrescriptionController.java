package com.priyanshu.clinical.controller;

import com.priyanshu.clinical.client.PatientClient;
import com.priyanshu.clinical.dto.CreatePrescriptionRequestDto;
import com.priyanshu.clinical.dto.PrescriptionResponseDto;
import com.priyanshu.clinical.service.PrescriptionService;
import com.priyanshu.clinical.ai.RateLimiter;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;

@RestController
@RequestMapping("/api/v1/prescriptions")
@RequiredArgsConstructor
public class PrescriptionController {

    private final PrescriptionService prescriptionService;
    private final PatientClient patientClient;

    // Token Bucket: max 10 PDF downloads per minute per user
    // 1 token per 6s = 60000ms / 10 = 6000ms refill rate
    // Protects against CPU-heavy PDF generation being hammered
    private final RateLimiter downloadLimiter = new RateLimiter(10, 6000);

    @GetMapping("/appointment/{appointmentId}")
    @PreAuthorize("hasAnyRole('PATIENT', 'DOCTOR', 'ADMIN')")
    public ResponseEntity<PrescriptionResponseDto> getPrescriptionByAppointmentId(@PathVariable Long appointmentId) {
        PrescriptionResponseDto rx = prescriptionService.getPrescriptionByAppointmentId(appointmentId);
        if (rx == null) {
            return ResponseEntity.noContent().build();
        }
        return ResponseEntity.ok(rx);
    }

    @PostMapping("/{appointmentId}")
    @PreAuthorize("hasAnyRole('DOCTOR', 'ADMIN')")
    public ResponseEntity<PrescriptionResponseDto> createPrescription(
            @PathVariable Long appointmentId,
            @RequestBody CreatePrescriptionRequestDto requestDto) {
        return ResponseEntity.ok(prescriptionService.createPrescription(appointmentId, requestDto));
    }

    @GetMapping("/{id}/download")
    @PreAuthorize("hasAnyRole('PATIENT', 'DOCTOR', 'ADMIN')")
    public ResponseEntity<byte[]> downloadPrescription(
            @PathVariable Long id,
            @RequestAttribute("userId") Long userId) throws Exception {
        // Rate limit PDF generation — CPU-heavy, protect against hammering
        if (userId != null && !downloadLimiter.tryAcquire(String.valueOf(userId))) {
            throw new ResponseStatusException(HttpStatus.TOO_MANY_REQUESTS,
                    "Too many download requests. Max 10 per minute.");
        }
        byte[] pdf = prescriptionService.downloadPrescriptionPdf(id);
        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=prescription.pdf")
                .contentType(MediaType.APPLICATION_PDF)
                .body(pdf);
    }

    @GetMapping("/my")
    @PreAuthorize("hasRole('PATIENT')")
    public ResponseEntity<List<PrescriptionResponseDto>> getMyPrescriptions(
            @RequestAttribute("userId") Long userId) {
        // Fetch patient email from patient-service via Feign client
        PatientClient.PatientSummaryDto patient = patientClient.getPatientSummary(userId);
        return ResponseEntity.ok(prescriptionService.getPrescriptionsForLoggedInPatient(patient.getEmail()));
    }
}
