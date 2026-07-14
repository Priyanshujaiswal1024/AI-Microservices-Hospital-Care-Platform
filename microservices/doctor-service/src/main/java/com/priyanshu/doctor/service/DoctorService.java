package com.priyanshu.doctor.service;

import com.priyanshu.doctor.client.AuthClient;
import com.priyanshu.doctor.dto.CreateDoctorRequestDto;
import com.priyanshu.doctor.dto.DoctorAvailabilityRequestDto;
import com.priyanshu.doctor.dto.DoctorAvailabilityResponseDto;
import com.priyanshu.doctor.dto.DoctorResponseDto;
import com.priyanshu.doctor.entity.Department;
import com.priyanshu.doctor.entity.Doctor;
import com.priyanshu.doctor.entity.DoctorAvailability;
import com.priyanshu.doctor.events.DoctorWelcomeEvent;
import com.priyanshu.doctor.repository.DepartmentRepository;
import com.priyanshu.doctor.repository.DoctorAvailabilityRepository;
import com.priyanshu.doctor.repository.DoctorRepository;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class DoctorService {

    private final DoctorRepository doctorRepository;
    private final DoctorAvailabilityRepository doctorAvailabilityRepository;
    private final DepartmentRepository departmentRepository;
    private final AuthClient authClient;
    private final KafkaTemplate<String, Object> kafkaTemplate;

    @Transactional(readOnly = true)
    public Page<DoctorResponseDto> getAllDoctors(int page, int size) {
        return doctorRepository.findAll(PageRequest.of(page, size))
                .map(this::mapToDto);
    }

    @Transactional
    public DoctorResponseDto onBoardNewDoctor(CreateDoctorRequestDto dto) {
        // 1. Call auth-service Feign client to create the user account
        AuthClient.CreateInternalUserRequestDto authRequest = new AuthClient.CreateInternalUserRequestDto(
                dto.getUsername(),
                dto.getPassword(),
                dto.getName(),
                dto.getPhoneNumber(),
                "DOCTOR"
        );
        
        Long userId = authClient.createInternalUser(authRequest);

        // 2. Build Doctor entity with the returned userId as ID
        Doctor doctor = Doctor.builder()
                .id(userId)
                .name(dto.getName())
                .email(dto.getEmail() != null ? dto.getEmail() : dto.getUsername())
                .specialization(dto.getSpecialization())
                .consultationFee(dto.getConsultationFee())
                .experienceYears(dto.getExperienceYears())
                .phoneNumber(dto.getPhoneNumber())
                .bio(dto.getBio())
                .profileImageUrl(dto.getProfileImageUrl())
                .build();

        // 3. Assign department if provided
        if (dto.getDepartmentId() != null) {
            Department department = departmentRepository.findById(dto.getDepartmentId())
                    .orElseThrow(() -> new EntityNotFoundException("Department not found: " + dto.getDepartmentId()));
            department.getDoctors().add(doctor);
            doctor.getDepartments().add(department);
        }

        Doctor saved = doctorRepository.save(doctor);
        log.info("New doctor onboarded in doctor-service: {} (id={})", saved.getName(), saved.getId());

        // 4. Publish welcome event via Kafka to notification-service
        try {
            kafkaTemplate.send("doctor.welcome", new DoctorWelcomeEvent(saved.getEmail(), saved.getName(), dto.getPassword()));
        } catch (Exception e) {
            log.error("Failed to publish doctor.welcome event to Kafka: {}", e.getMessage());
        }

        return mapToDto(saved);
    }

    @Transactional
    public DoctorResponseDto updateDoctor(Long doctorId, CreateDoctorRequestDto dto) {
        Doctor doctor = doctorRepository.findById(doctorId)
                .orElseThrow(() -> new EntityNotFoundException("Doctor not found: " + doctorId));

        doctor.setName(dto.getName());
        doctor.setEmail(dto.getEmail());
        doctor.setSpecialization(dto.getSpecialization());
        if (dto.getConsultationFee() != null) {
            doctor.setConsultationFee(dto.getConsultationFee());
        }
        if (dto.getExperienceYears() != null) {
            doctor.setExperienceYears(dto.getExperienceYears());
        }
        if (dto.getPhoneNumber() != null) {
            doctor.setPhoneNumber(dto.getPhoneNumber());
        }
        if (dto.getBio() != null) {
            doctor.setBio(dto.getBio());
        }
        if (dto.getProfileImageUrl() != null) {
            doctor.setProfileImageUrl(dto.getProfileImageUrl());
        }

        return mapToDto(doctorRepository.save(doctor));
    }

    @Transactional
    public void deleteDoctor(Long doctorId) {
        Doctor doctor = doctorRepository.findById(doctorId)
                .orElseThrow(() -> new EntityNotFoundException("Doctor not found: " + doctorId));
        doctorRepository.delete(doctor);
    }

    @Transactional(readOnly = true)
    public DoctorResponseDto getDoctorById(Long doctorId) {
        Doctor doctor = doctorRepository.findById(doctorId)
                .orElseThrow(() -> new EntityNotFoundException("Doctor not found: " + doctorId));
        return mapToDto(doctor);
    }

    @Transactional(readOnly = true)
    public Page<DoctorResponseDto> searchDoctors(String name, String specialization, int page, int size) {
        Pageable pageable = PageRequest.of(page, size);
        if (name != null && specialization != null) {
            return doctorRepository.findByNameContainingIgnoreCaseAndSpecializationIgnoreCase(name, specialization, pageable)
                    .map(this::mapToDto);
        }
        if (name != null) {
            return doctorRepository.findByNameContainingIgnoreCase(name, pageable)
                    .map(this::mapToDto);
        }
        if (specialization != null) {
            return doctorRepository.findBySpecializationIgnoreCase(specialization, pageable)
                    .map(this::mapToDto);
        }
        return doctorRepository.findAll(pageable).map(this::mapToDto);
    }

    @Transactional
    public void addDoctorAvailability(Long doctorId, DoctorAvailabilityRequestDto dto) {
        Doctor doctor = doctorRepository.findById(doctorId)
                .orElseThrow(() -> new EntityNotFoundException("Doctor not found: " + doctorId));

        boolean slotExists = doctorAvailabilityRepository.existsByDoctorIdAndDate(doctorId, dto.getDate());
        if (slotExists) {
            throw new RuntimeException("Availability already set for this date: " + dto.getDate());
        }

        DoctorAvailability availability = DoctorAvailability.builder()
                .doctor(doctor)
                .date(dto.getDate())
                .startTime(dto.getStartTime())
                .endTime(dto.getEndTime())
                .maxSlots(dto.getMaxSlots() != null ? dto.getMaxSlots() : 10)
                .bookedSlots(0)
                .build();

        doctorAvailabilityRepository.save(availability);
    }

    @Transactional(readOnly = true)
    public List<DoctorAvailabilityResponseDto> getMyAvailability(Long doctorId) {
        return doctorAvailabilityRepository.findByDoctorId(doctorId)
                .stream()
                .map(av -> {
                    DoctorAvailabilityResponseDto dto = new DoctorAvailabilityResponseDto();
                    dto.setId(av.getId());
                    dto.setDate(av.getDate());
                    dto.setStartTime(av.getStartTime());
                    dto.setEndTime(av.getEndTime());
                    dto.setMaxSlots(av.getMaxSlots());
                    dto.setBookedSlots(av.getBookedSlots());
                    return dto;
                })
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public boolean isDoctorAvailableOnDate(Long doctorId, LocalDate date) {
        return doctorAvailabilityRepository.existsByDoctorIdAndDate(doctorId, date);
    }

    @Transactional(readOnly = true)
    public DoctorAvailabilityResponseDto getAvailabilityByDate(Long doctorId, LocalDate date) {
        return doctorAvailabilityRepository.findByDoctorIdAndDate(doctorId, date)
                .map(av -> {
                    DoctorAvailabilityResponseDto dto = new DoctorAvailabilityResponseDto();
                    dto.setId(av.getId());
                    dto.setDate(av.getDate());
                    dto.setStartTime(av.getStartTime());
                    dto.setEndTime(av.getEndTime());
                    dto.setMaxSlots(av.getMaxSlots());
                    dto.setBookedSlots(av.getBookedSlots());
                    return dto;
                })
                .orElse(null);
    }

    @Transactional(readOnly = true)
    public List<DoctorAvailabilityResponseDto> getUpcomingAvailabilities(Long doctorId) {
        return doctorAvailabilityRepository.findByDoctorIdAndDateAfter(doctorId, LocalDate.now().minusDays(1))
                .stream()
                .map(av -> {
                    DoctorAvailabilityResponseDto dto = new DoctorAvailabilityResponseDto();
                    dto.setId(av.getId());
                    dto.setDate(av.getDate());
                    dto.setStartTime(av.getStartTime());
                    dto.setEndTime(av.getEndTime());
                    dto.setMaxSlots(av.getMaxSlots());
                    dto.setBookedSlots(av.getBookedSlots());
                    return dto;
                })
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public long getStatsCount() {
        return doctorRepository.count();
    }

    private DoctorResponseDto mapToDto(Doctor d) {
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
                        .collect(Collectors.toSet())
        );
        return dto;
    }
}
