package com.priyanshu.clinical.client;

import lombok.Data;
import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PatchMapping;
import java.time.LocalDateTime;

@FeignClient(name = "appointment-service", url = "${appointment.service.url}")
public interface AppointmentClient {

    @GetMapping("/api/v1/appointments/{id}")
    AppointmentResponseDto getAppointmentById(@PathVariable("id") Long id);

    @org.springframework.web.bind.annotation.PutMapping("/api/v1/appointments/{id}/complete")
    AppointmentResponseDto completeAppointment(@PathVariable("id") Long id);

    @Data
    @com.fasterxml.jackson.annotation.JsonIgnoreProperties(ignoreUnknown = true)
    class AppointmentResponseDto {
        private Long id;
        private Long patientId;
        private Long doctorId;
        private String patientName;
        private String doctorName;
        private LocalDateTime appointmentTime;
        private String reason;
        private String status;
    }
}
