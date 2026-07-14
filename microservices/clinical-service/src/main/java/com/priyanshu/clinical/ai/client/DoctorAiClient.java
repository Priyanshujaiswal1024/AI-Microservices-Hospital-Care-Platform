package com.priyanshu.clinical.ai.client;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import lombok.Data;
import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.GetMapping;

import java.util.List;
import java.util.Set;

@FeignClient(name = "doctor-ai-client", url = "${doctor.service.url}")
public interface DoctorAiClient {

    @GetMapping("/internal/doctors")
    List<DoctorDto> getAllDoctors();

    @GetMapping("/internal/doctors/{doctorId}/availabilities")
    List<AvailabilityDto> getDoctorAvailabilities(@org.springframework.web.bind.annotation.PathVariable("doctorId") Long doctorId);

    @Data
    @JsonIgnoreProperties(ignoreUnknown = true)
    class DoctorDto {
        private Long id;
        private String name;
        private String email;
        private String specialization;
        private Double consultationFee;
        private Integer experienceYears;
        private String phoneNumber;
        private String bio;
        private Set<String> departments;
    }

    @Data
    @JsonIgnoreProperties(ignoreUnknown = true)
    class AvailabilityDto {
        private Long id;
        private java.time.LocalDate date;
        private java.time.LocalTime startTime;
        private java.time.LocalTime endTime;
        private Integer maxSlots;
        private Integer bookedSlots;
    }
}
