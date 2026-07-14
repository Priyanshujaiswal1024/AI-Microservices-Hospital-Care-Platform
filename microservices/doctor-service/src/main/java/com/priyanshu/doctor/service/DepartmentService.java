package com.priyanshu.doctor.service;

import com.priyanshu.doctor.dto.CreateDepartmentRequestDto;
import com.priyanshu.doctor.dto.DepartmentResponseDto;
import com.priyanshu.doctor.dto.DoctorResponseDto;
import com.priyanshu.doctor.entity.Department;
import com.priyanshu.doctor.entity.Doctor;
import com.priyanshu.doctor.repository.DepartmentRepository;
import com.priyanshu.doctor.repository.DoctorRepository;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class DepartmentService {

    private final DepartmentRepository departmentRepository;
    private final DoctorRepository doctorRepository;

    @Transactional
    public DepartmentResponseDto createDepartment(CreateDepartmentRequestDto dto) {
        if (departmentRepository.existsByNameIgnoreCase(dto.getName())) {
            throw new IllegalArgumentException("Department already exists: " + dto.getName());
        }

        Department department = new Department();
        department.setName(dto.getName());

        if (dto.getHeadDoctorId() != null) {
            Doctor headDoctor = doctorRepository.findById(dto.getHeadDoctorId())
                    .orElseThrow(() -> new EntityNotFoundException("Doctor not found: " + dto.getHeadDoctorId()));
            department.setHeadDoctorId(headDoctor.getId());
        }

        return mapToDto(departmentRepository.save(department));
    }

    @Transactional
    public DepartmentResponseDto addDoctorToDepartment(Long departmentId, Long doctorId) {
        Department department = departmentRepository.findById(departmentId)
                .orElseThrow(() -> new EntityNotFoundException("Department not found: " + departmentId));

        Doctor doctor = doctorRepository.findById(doctorId)
                .orElseThrow(() -> new EntityNotFoundException("Doctor not found: " + doctorId));

        if (department.getDoctors().contains(doctor)) {
            throw new IllegalStateException("Doctor already exists in this department");
        }

        department.getDoctors().add(doctor);
        doctor.getDepartments().add(department);

        return mapToDto(departmentRepository.save(department));
    }

    @Transactional
    public DepartmentResponseDto assignHeadDoctor(Long departmentId, Long doctorId) {
        Department department = departmentRepository.findById(departmentId)
                .orElseThrow(() -> new EntityNotFoundException("Department not found: " + departmentId));

        Doctor doctor = doctorRepository.findById(doctorId)
                .orElseThrow(() -> new EntityNotFoundException("Doctor not found: " + doctorId));

        if (!department.getDoctors().contains(doctor)) {
            department.getDoctors().add(doctor);
            doctor.getDepartments().add(department);
        }

        department.setHeadDoctorId(doctor.getId());
        return mapToDto(departmentRepository.save(department));
    }

    @Transactional(readOnly = true)
    public List<DepartmentResponseDto> getAllDepartments() {
        return departmentRepository.findAll()
                .stream()
                .map(this::mapToDto)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<DoctorResponseDto> getDoctorsByDepartment(Long departmentId) {
        Department department = departmentRepository.findById(departmentId)
                .orElseThrow(() -> new EntityNotFoundException("Department not found: " + departmentId));

        return doctorRepository.findByDepartments(department)
                .stream()
                .map(this::mapToDoctorDto)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public long getStatsCount() {
        return departmentRepository.count();
    }

    private DepartmentResponseDto mapToDto(Department d) {
        DepartmentResponseDto dto = new DepartmentResponseDto();
        dto.setId(d.getId());
        dto.setName(d.getName());
        
        String headName = "—";
        if (d.getHeadDoctorId() != null) {
            headName = doctorRepository.findById(d.getHeadDoctorId())
                    .map(Doctor::getName)
                    .orElse("—");
        }
        dto.setHeadDoctorName(headName);

        dto.setDoctorNames(
                d.getDoctors().stream()
                        .map(Doctor::getName)
                        .collect(Collectors.toSet()));
        return dto;
    }

    private DoctorResponseDto mapToDoctorDto(Doctor d) {
        DoctorResponseDto dto = new DoctorResponseDto();
        dto.setId(d.getId());
        dto.setName(d.getName());
        dto.setEmail(d.getEmail());
        dto.setSpecialization(d.getSpecialization());
        dto.setConsultationFee(d.getConsultationFee());
        dto.setExperienceYears(d.getExperienceYears());
        dto.setPhoneNumber(d.getPhoneNumber());
        dto.setBio(d.getBio());
        dto.setProfileImageUrl(d.getProfileImageUrl());
        dto.setDepartments(
                d.getDepartments().stream()
                        .map(Department::getName)
                        .collect(Collectors.toSet()));
        return dto;
    }
}
