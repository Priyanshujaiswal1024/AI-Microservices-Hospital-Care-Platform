package com.priyanshu.patient.service;

import com.priyanshu.patient.dto.*;
import com.priyanshu.patient.entity.Insurance;
import com.priyanshu.patient.entity.Patient;
import com.priyanshu.patient.repository.InsuranceRepository;
import com.priyanshu.patient.repository.PatientRepository;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class PatientService {

    private final PatientRepository patientRepository;
    private final InsuranceRepository insuranceRepository;

    @Transactional
    public PatientResponseDto createPatientProfile(CreatePatientProfileRequestDto dto, Long userId) {
        if (patientRepository.existsById(userId)) {
            throw new RuntimeException("Patient profile already exists");
        }

        Patient patient = Patient.builder()
                .id(userId)
                .name(dto.getName())
                .fatherName(dto.getFatherName())
                .birthDate(dto.getBirthDate())
                .email(dto.getEmail())
                .phone(dto.getPhone())
                .gender(dto.getGender())
                .address(dto.getAddress())
                .city(dto.getCity())
                .state(dto.getState())
                .pincode(dto.getPincode())
                .emergencyContactName(dto.getEmergencyContactName())
                .emergencyContactPhone(dto.getEmergencyContactPhone())
                .bloodGroup(dto.getBloodGroup())
                .height(dto.getHeight())
                .weight(dto.getWeight())
                .build();

        return mapToDto(patientRepository.save(patient));
    }

    @Transactional(readOnly = true)
    public PatientResponseDto getMyProfile(Long userId) {
        Patient patient = patientRepository.findById(userId)
                .orElseThrow(() -> new EntityNotFoundException("Patient profile not found"));
        return mapToDto(patient);
    }

    @Transactional(readOnly = true)
    public PatientResponseDto getPatientByUserId(Long userId) {
        Patient patient = patientRepository.findById(userId)
                .orElseThrow(() -> new EntityNotFoundException("Patient not found for userId: " + userId));
        return mapToDto(patient);
    }

    @Transactional(readOnly = true)
    public List<PatientResponseDto> getAllPatients(int page, int size) {
        return patientRepository.findAll(PageRequest.of(page, size))
                .stream()
                .map(this::mapToDto)
                .collect(Collectors.toList());
    }

    @Transactional
    public PatientResponseDto updatePatientProfile(UpdatePatientRequestDto dto, Long userId) {
        Patient patient = patientRepository.findById(userId)
                .orElseThrow(() -> new EntityNotFoundException("Patient not found: " + userId));

        if (dto.getPhone() != null) {
            patient.setPhone(dto.getPhone());
        }
        if (dto.getAddress() != null) {
            patient.setAddress(dto.getAddress());
        }
        if (dto.getCity() != null) {
            patient.setCity(dto.getCity());
        }
        if (dto.getState() != null) {
            patient.setState(dto.getState());
        }
        if (dto.getPincode() != null) {
            patient.setPincode(dto.getPincode());
        }
        if (dto.getEmergencyContactName() != null) {
            patient.setEmergencyContactName(dto.getEmergencyContactName());
        }
        if (dto.getEmergencyContactPhone() != null) {
            patient.setEmergencyContactPhone(dto.getEmergencyContactPhone());
        }
        if (dto.getHeight() != null) {
            patient.setHeight(dto.getHeight());
        }
        if (dto.getWeight() != null) {
            patient.setWeight(dto.getWeight());
        }

        return mapToDto(patientRepository.save(patient));
    }

    @Transactional
    public InsuranceResponseDto addInsurance(Long userId, CreateInsuranceRequestDto dto) {
        Patient patient = patientRepository.findById(userId)
                .orElseThrow(() -> new EntityNotFoundException("Patient not found for userId: " + userId));

        Insurance insurance = patient.getInsurance();
        if (insurance == null) {
            insurance = new Insurance();
            insurance.setPatient(patient);
        }

        insurance.setProvider(dto.getProvider());
        insurance.setPolicyNumber(dto.getPolicyNumber());
        
        LocalDate expiry = dto.getExpiryDate() != null ? dto.getExpiryDate() : dto.getValidUntil();
        insurance.setValidUntil(expiry);
        insurance.setCoverageAmount(dto.getCoverageAmount());

        return mapToInsuranceDto(insuranceRepository.save(insurance));
    }

    @Transactional
    public void deleteInsurance(Long userId) {
        Patient patient = patientRepository.findById(userId)
                .orElseThrow(() -> new EntityNotFoundException("Patient not found for userId: " + userId));
        if (patient.getInsurance() != null) {
            patient.setInsurance(null);
            patientRepository.save(patient);
        }
    }

    @Transactional(readOnly = true)
    public InsuranceResponseDto getInsurance(Long userId) {
        Patient patient = patientRepository.findById(userId)
                .orElseThrow(() -> new EntityNotFoundException("Patient not found"));

        Insurance insurance = patient.getInsurance();
        if (insurance == null) {
            throw new EntityNotFoundException("No insurance found for this patient");
        }

        return mapToInsuranceDto(insurance);
    }

    @Transactional(readOnly = true)
    public long getStatsCount() {
        return patientRepository.count();
    }

    private PatientResponseDto mapToDto(Patient p) {
        PatientResponseDto dto = new PatientResponseDto();
        dto.setId(p.getId());
        dto.setName(p.getName());
        dto.setFatherName(p.getFatherName());
        dto.setBirthDate(p.getBirthDate());
        dto.setGender(p.getGender());
        dto.setAddress(p.getAddress());
        dto.setCity(p.getCity());
        dto.setState(p.getState());
        dto.setPincode(p.getPincode());
        dto.setEmergencyContactName(p.getEmergencyContactName());
        dto.setEmergencyContactPhone(p.getEmergencyContactPhone());
        dto.setBloodGroup(p.getBloodGroup());
        dto.setHeight(p.getHeight());
        dto.setWeight(p.getWeight());
        dto.setCreatedAt(p.getCreatedAt());
        dto.setEmail(p.getEmail());
        dto.setPhone(p.getPhone());
        if (p.getInsurance() != null) {
            dto.setInsurance(mapToInsuranceDto(p.getInsurance()));
        }
        return dto;
    }

    private InsuranceResponseDto mapToInsuranceDto(Insurance i) {
        InsuranceResponseDto dto = new InsuranceResponseDto();
        dto.setId(i.getId());
        dto.setProvider(i.getProvider());
        dto.setPolicyNumber(i.getPolicyNumber());
        dto.setValidUntil(i.getValidUntil());
        dto.setExpiryDate(i.getValidUntil());
        dto.setCoverageAmount(i.getCoverageAmount());
        dto.setCreatedAt(i.getCreatedAt());
        dto.setPatientId(i.getPatient() != null ? i.getPatient().getId() : null);
        return dto;
    }
}
