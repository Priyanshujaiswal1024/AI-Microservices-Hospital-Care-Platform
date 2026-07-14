package com.priyanshu.clinical.client;

import lombok.Data;
import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;

@FeignClient(name = "patient-service", url = "${patient.service.url}")
public interface PatientClient {

    @GetMapping("/api/v1/patients/{id}/summary")
    PatientSummaryDto getPatientSummary(@PathVariable("id") Long id);

    @GetMapping("/api/v1/patients/{id}")
    PatientFullDto getPatientById(@PathVariable("id") Long id);

    @Data
    @com.fasterxml.jackson.annotation.JsonIgnoreProperties(ignoreUnknown = true)
    class PatientSummaryDto {
        private Long id;
        private String name;
        private String email;
        private String phone;
    }

    @Data
    @com.fasterxml.jackson.annotation.JsonIgnoreProperties(ignoreUnknown = true)
    class PatientFullDto {
        private Long id;
        private String name;
        private String fatherName;
        private String birthDate;
        private String email;
        private String phone;
        private String gender;
        private String address;
        private String city;
        private String state;
        private String pincode;
        private String emergencyContactName;
        private String emergencyContactPhone;
        private String bloodGroup;
        private Double height;
        private Double weight;
    }
}
