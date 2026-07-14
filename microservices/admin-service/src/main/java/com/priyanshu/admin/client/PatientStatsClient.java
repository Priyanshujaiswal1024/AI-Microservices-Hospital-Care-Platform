package com.priyanshu.admin.client;

import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.GetMapping;

import java.util.Map;

@FeignClient(name = "patient-stats", url = "${patient.service.url}")
public interface PatientStatsClient {
    @GetMapping("/api/v1/patients/stats")
    Map<String, Long> getPatientStats();
}
