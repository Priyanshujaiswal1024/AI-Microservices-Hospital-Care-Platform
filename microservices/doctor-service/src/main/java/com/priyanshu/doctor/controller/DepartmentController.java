package com.priyanshu.doctor.controller;

import com.priyanshu.doctor.dto.AddDoctorToDepartmentDto;
import com.priyanshu.doctor.dto.CreateDepartmentRequestDto;
import com.priyanshu.doctor.dto.DepartmentResponseDto;
import com.priyanshu.doctor.dto.DoctorResponseDto;
import com.priyanshu.doctor.service.DepartmentService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/v1/departments")
@RequiredArgsConstructor
public class DepartmentController {

    private final DepartmentService departmentService;

    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<DepartmentResponseDto> createDepartment(
            @RequestBody CreateDepartmentRequestDto dto) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(departmentService.createDepartment(dto));
    }

    @PostMapping("/add-doctor")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<DepartmentResponseDto> addDoctorToDepartment(
            @RequestBody AddDoctorToDepartmentDto dto) {
        return ResponseEntity.ok(departmentService.addDoctorToDepartment(
                dto.getDepartmentId(), dto.getDoctorId()));
    }

    @PatchMapping("/{departmentId}/head-doctor/{doctorId}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<DepartmentResponseDto> assignHeadDoctor(
            @PathVariable Long departmentId,
            @PathVariable Long doctorId) {
        return ResponseEntity.ok(departmentService.assignHeadDoctor(departmentId, doctorId));
    }

    @GetMapping
    public ResponseEntity<List<DepartmentResponseDto>> getAllDepartments() {
        return ResponseEntity.ok(departmentService.getAllDepartments());
    }

    @GetMapping("/{id}/doctors")
    public ResponseEntity<List<DoctorResponseDto>> getDoctorsByDepartment(@PathVariable Long id) {
        return ResponseEntity.ok(departmentService.getDoctorsByDepartment(id));
    }

    // Called by Feign client in admin-service dashboard
    @GetMapping("/stats")
    public ResponseEntity<Map<String, Long>> getDepartmentStats() {
        Map<String, Long> stats = new HashMap<>();
        stats.put("totalDepartments", departmentService.getStatsCount());
        return ResponseEntity.ok(stats);
    }
}
