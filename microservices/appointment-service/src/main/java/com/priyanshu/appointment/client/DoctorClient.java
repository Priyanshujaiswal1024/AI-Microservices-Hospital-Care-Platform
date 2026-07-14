package com.priyanshu.appointment.client;

import com.priyanshu.appointment.dto.external.DoctorSummaryDto;
import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestParam;

import java.time.LocalDate;

/**
 * Feign client to call doctor-service.
 * base URL resolved via ${doctor.service.url} env var.
 */
@FeignClient(name = "doctor-service", url = "${doctor.service.url}")
public interface DoctorClient {

    @GetMapping("/api/v1/doctors/{id}/summary")
    DoctorSummaryDto getDoctorSummary(@PathVariable Long id);

    @GetMapping("/api/v1/doctors/{id}/availability")
    boolean isDoctorAvailableOnDate(
            @PathVariable Long id,
            @RequestParam("date") String date  // ISO date: 2025-01-15
    );
}
