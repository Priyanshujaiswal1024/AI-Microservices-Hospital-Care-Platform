package com.priyanshu.appointment.controller;

import com.fasterxml.jackson.annotation.JsonFormat;
import com.priyanshu.appointment.dto.AppointmentRequestDto;
import com.priyanshu.appointment.dto.AppointmentResponseDto;
import com.priyanshu.appointment.service.AppointmentService;
import lombok.Data;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.List;

/**
 * Internal appointment booking endpoint for AI assistant.
 * Exposed at POST /internal/book — no auth token required.
 * Security: /internal/** is already permitted in DownstreamSecurityConfig.
 *
 * Called by clinical-service AiChatTools.bookAppointment() tool function.
 */
@Slf4j
@RestController
@RequestMapping("/internal")
@RequiredArgsConstructor
public class InternalAppointmentController {

    private final AppointmentService appointmentService;

    @PostMapping("/book")
    public ResponseEntity<AppointmentResponseDto> bookForPatient(
            @RequestBody BookRequest request) {
        log.info("[Internal] AI booking request: patientId={}, doctorId={}, time={}",
            request.getPatientId(), request.getDoctorId(), request.getAppointmentTime());

        AppointmentRequestDto dto = new AppointmentRequestDto();
        dto.setDoctorId(request.getDoctorId());

        // Parse ISO datetime string → LocalDateTime
        LocalDateTime appointmentTime = LocalDateTime.parse(
            request.getAppointmentTime(),
            DateTimeFormatter.ofPattern("yyyy-MM-dd'T'HH:mm:ss")
        );
        dto.setAppointmentTime(appointmentTime);
        dto.setReason(request.getReason() != null ? request.getReason() : "Consultation via AI Assistant");

        // Use patientId as userId (patient's own booking)
        AppointmentResponseDto response = appointmentService.createAppointment(dto, request.getPatientId());
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @GetMapping("/doctor/{doctorId}")
    public ResponseEntity<List<AppointmentResponseDto>> getDoctorAppointmentsInternal(
            @PathVariable("doctorId") Long doctorId) {
        log.info("[Internal] Fetching appointments for doctorId={}", doctorId);
        return ResponseEntity.ok(appointmentService.getAppointmentsForDoctor(doctorId));
    }

    @PatchMapping("/{appointmentId}/complete")
    public ResponseEntity<AppointmentResponseDto> completeAppointmentInternal(
            @PathVariable("appointmentId") Long appointmentId) {
        log.info("[Internal] Completing appointmentId={}", appointmentId);
        return ResponseEntity.ok(appointmentService.markCompleted(appointmentId));
    }

    @Data
    public static class BookRequest {
        private Long patientId;
        private Long doctorId;
        private String appointmentTime; // "yyyy-MM-dd'T'HH:mm:ss"
        private String reason;
    }
}
