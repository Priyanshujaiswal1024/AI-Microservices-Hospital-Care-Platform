package com.priyanshu.appointment.controller;

import com.priyanshu.appointment.dto.AppointmentRequestDto;
import com.priyanshu.appointment.dto.AppointmentResponseDto;
import com.priyanshu.appointment.service.AppointmentService;
import com.priyanshu.appointment.util.RateLimiter;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;
import java.util.Map;
import java.util.HashMap;

@RestController
@RequestMapping("/api/v1/appointments")
@RequiredArgsConstructor
public class AppointmentController {

    private final AppointmentService appointmentService;

    // Rate Limiter: Max 3 bookings per 5 minutes (300,000 ms) per patient
    private final RateLimiter bookingLimiter = new RateLimiter(3, 300000);

    /** POST /api/v1/appointments — PATIENT only */
    @PostMapping
    @PreAuthorize("hasRole('PATIENT')")
    public ResponseEntity<AppointmentResponseDto> create(
            @Valid @RequestBody AppointmentRequestDto dto,
            @RequestAttribute("userId") Long userId) {
        
        if (userId != null && !bookingLimiter.tryAcquire(String.valueOf(userId))) {
            throw new ResponseStatusException(HttpStatus.TOO_MANY_REQUESTS, "Too many appointment booking requests. Max 3 per 5 minutes.");
        }
        
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(appointmentService.createAppointment(dto, userId));
    }

    /** DELETE /api/v1/appointments/{id}/cancel — PATIENT only */
    @PatchMapping("/{id}/cancel")
    @PreAuthorize("hasRole('PATIENT')")
    public ResponseEntity<Void> cancel(@PathVariable Long id) {
        appointmentService.cancelAppointment(id);
        return ResponseEntity.noContent().build();
    }

    @RequestMapping(value = "/{id}/complete", method = {RequestMethod.PUT, RequestMethod.PATCH})
    @PreAuthorize("hasAnyRole('DOCTOR','ADMIN')")
    public ResponseEntity<AppointmentResponseDto> complete(@PathVariable Long id) {
        return ResponseEntity.ok(appointmentService.markCompleted(id));
    }

    /** PATCH /api/v1/appointments/{id}/reassign?doctorId=... — ADMIN only */
    @PatchMapping("/{id}/reassign")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<AppointmentResponseDto> reassign(
            @PathVariable Long id,
            @RequestParam Long doctorId) {
        return ResponseEntity.ok(appointmentService.reassignDoctor(id, doctorId));
    }

    /** GET /api/v1/appointments/patient?page=0&size=10 — PATIENT only */
    @GetMapping("/patient")
    @PreAuthorize("hasRole('PATIENT')")
    public ResponseEntity<List<AppointmentResponseDto>> getForPatient(
            @RequestAttribute("userId") Long userId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        return ResponseEntity.ok(appointmentService.getAppointmentsForPatient(userId, page, size));
    }

    /** GET /api/v1/appointments/doctor — DOCTOR or ADMIN */
    @GetMapping("/doctor")
    @PreAuthorize("hasAnyRole('DOCTOR','ADMIN')")
    public ResponseEntity<List<AppointmentResponseDto>> getForDoctor(
            @RequestAttribute("userId") Long userId) {
        return ResponseEntity.ok(appointmentService.getAppointmentsForDoctor(userId));
    }

    /** GET /api/v1/appointments/patient/upcoming */
    @GetMapping("/patient/upcoming")
    @PreAuthorize("hasRole('PATIENT')")
    public ResponseEntity<List<AppointmentResponseDto>> upcomingForPatient(
            @RequestAttribute("userId") Long userId) {
        return ResponseEntity.ok(appointmentService.getUpcomingForPatient(userId));
    }

    /** GET /api/v1/appointments/doctor/upcoming */
    @GetMapping("/doctor/upcoming")
    @PreAuthorize("hasAnyRole('DOCTOR','ADMIN')")
    public ResponseEntity<List<AppointmentResponseDto>> upcomingForDoctor(
            @RequestAttribute("userId") Long userId) {
        return ResponseEntity.ok(appointmentService.getUpcomingForDoctor(userId));
    }

    /** GET /api/v1/appointments/{id} */
    @GetMapping("/{id}")
    public ResponseEntity<AppointmentResponseDto> getById(@PathVariable Long id) {
        return ResponseEntity.ok(appointmentService.getAppointmentById(id));
    }

    // Called by Feign client in admin-service dashboard
    @GetMapping("/stats")
    public ResponseEntity<Map<String, Long>> getAppointmentStats() {
        Map<String, Long> stats = new HashMap<>();
        stats.put("totalAppointments", appointmentService.getStatsCount());
        stats.put("todayAppointments", appointmentService.getTodayCount());
        return ResponseEntity.ok(stats);
    }

    // Called by doctor-service to fetch booked time slots of doctor
    @GetMapping("/internal/booked-slots")
    public ResponseEntity<List<java.time.LocalTime>> getBookedSlots(
            @RequestParam Long doctorId,
            @RequestParam String start,
            @RequestParam String end) {
        java.time.LocalDateTime startTime = java.time.LocalDateTime.parse(start);
        java.time.LocalDateTime endTime = java.time.LocalDateTime.parse(end);
        return ResponseEntity.ok(appointmentService.getBookedSlotsForDoctor(doctorId, startTime, endTime));
    }
}
