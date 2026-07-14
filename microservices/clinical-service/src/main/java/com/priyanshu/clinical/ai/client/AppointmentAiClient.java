package com.priyanshu.clinical.ai.client;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import lombok.Data;
import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;

import java.util.List;

@FeignClient(name = "appointment-ai-client", url = "${appointment.service.url}")
public interface AppointmentAiClient {

    @PostMapping("/internal/book")
    AppointmentConfirmDto bookAppointment(@RequestBody BookRequest request);

    @org.springframework.web.bind.annotation.GetMapping("/internal/doctor/{doctorId}")
    List<AppointmentConfirmDto> getDoctorAppointments(@org.springframework.web.bind.annotation.PathVariable("doctorId") Long doctorId);

    @org.springframework.web.bind.annotation.PatchMapping("/internal/{appointmentId}/complete")
    AppointmentConfirmDto completeAppointment(@org.springframework.web.bind.annotation.PathVariable("appointmentId") Long appointmentId);

    @Data
    class BookRequest {
        private Long patientId;
        private Long doctorId;
        private String appointmentTime; // "yyyy-MM-dd'T'HH:mm:ss"
        private String reason;
    }

    @Data
    @JsonIgnoreProperties(ignoreUnknown = true)
    class AppointmentConfirmDto {
        private Long id;
        private Long patientId;
        private String doctorName;
        private String patientName;
        private String appointmentTime;
        private String status;
    }
}
