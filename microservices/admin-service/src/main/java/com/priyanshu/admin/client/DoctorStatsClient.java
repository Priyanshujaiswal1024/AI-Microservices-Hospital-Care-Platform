package com.priyanshu.admin.client;

import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.GetMapping;

import java.util.Map;

@FeignClient(name = "doctor-stats", url = "${doctor.service.url}")
public interface DoctorStatsClient {
    @GetMapping("/api/v1/doctors/stats")
    Map<String, Long> getDoctorStats();
}
