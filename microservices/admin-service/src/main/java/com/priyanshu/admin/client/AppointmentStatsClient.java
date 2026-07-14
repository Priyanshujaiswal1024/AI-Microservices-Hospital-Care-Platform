package com.priyanshu.admin.client;

import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.GetMapping;

import java.util.Map;

@FeignClient(name = "appointment-stats", url = "${appointment.service.url}")
public interface AppointmentStatsClient {
    @GetMapping("/api/v1/appointments/stats")
    Map<String, Long> getAppointmentStats();
}
