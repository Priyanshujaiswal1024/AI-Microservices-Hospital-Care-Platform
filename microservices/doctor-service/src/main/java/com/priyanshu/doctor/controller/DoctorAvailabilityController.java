package com.priyanshu.doctor.controller;

import com.priyanshu.doctor.dto.AvailableSlotDto;
import com.priyanshu.doctor.service.DoctorAvailabilityService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/public/doctors")
@RequiredArgsConstructor
public class DoctorAvailabilityController {

    private final DoctorAvailabilityService doctorAvailabilityService;

    @GetMapping("/{doctorId}/slots")
    public ResponseEntity<List<AvailableSlotDto>> getSlots(
            @PathVariable Long doctorId,
            @RequestParam String date) {
        LocalDate localDate = LocalDate.parse(date);
        return ResponseEntity.ok(doctorAvailabilityService.getAvailableSlots(doctorId, localDate));
    }
}
