package com.priyanshu.doctor.controller;

import com.priyanshu.doctor.dto.DepartmentResponseDto;
import com.priyanshu.doctor.dto.DoctorResponseDto;
import com.priyanshu.doctor.service.DepartmentService;
import com.priyanshu.doctor.service.DoctorService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/public")
@RequiredArgsConstructor
public class HospitalController {

    private final DoctorService doctorService;
    private final DepartmentService departmentService;

    @GetMapping("/doctors")
    public ResponseEntity<Page<DoctorResponseDto>> searchDoctors(
            @RequestParam(required = false) String name,
            @RequestParam(required = false) String specialization,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        return ResponseEntity.ok(doctorService.searchDoctors(name, specialization, page, size));
    }

    @GetMapping("/departments")
    public ResponseEntity<List<DepartmentResponseDto>> getAllDepartments() {
        return ResponseEntity.ok(departmentService.getAllDepartments());
    }

    @GetMapping("/departments/{id}/doctors")
    public ResponseEntity<List<DoctorResponseDto>> getDoctorsByDepartment(@PathVariable Long id) {
        return ResponseEntity.ok(departmentService.getDoctorsByDepartment(id));
    }
}
