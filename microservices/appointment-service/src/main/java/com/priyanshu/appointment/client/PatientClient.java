package com.priyanshu.appointment.client;

import com.priyanshu.appointment.dto.external.PatientSummaryDto;
import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;

/**
 * Feign client to call patient-service.
 */
@FeignClient(name = "patient-service", url = "${patient.service.url}")
public interface PatientClient {

    @GetMapping("/api/v1/patients/{id}/summary")
    PatientSummaryDto getPatientSummary(@PathVariable Long id);
}
