package com.priyanshu.doctor.controller;

import com.priyanshu.doctor.dto.DoctorResponseDto;
import com.priyanshu.doctor.service.DoctorService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/internal")
@RequiredArgsConstructor
public class InternalDoctorController {

    private final DoctorService doctorService;

    @GetMapping("/doctors")
    public ResponseEntity<List<DoctorResponseDto>> getAllDoctorsInternal() {
        // Fetch all doctors (by converting the Page to List)
        return ResponseEntity.ok(doctorService.getAllDoctors(0, 100).getContent());
    }

    @GetMapping("/doctors/{doctorId}/availabilities")
    public ResponseEntity<List<com.priyanshu.doctor.dto.DoctorAvailabilityResponseDto>> getDoctorAvailabilitiesInternal(
            @PathVariable("doctorId") Long doctorId) {
        return ResponseEntity.ok(doctorService.getUpcomingAvailabilities(doctorId));
    }
}
