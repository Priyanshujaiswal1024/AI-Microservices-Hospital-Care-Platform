package com.priyanshu.admin.client;

import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.GetMapping;

import java.util.Map;

@FeignClient(name = "pharmacy-stats", url = "${pharmacy.service.url}")
public interface PharmacyStatsClient {
    @GetMapping("/api/v1/medicines/stats")
    Map<String, Long> getPharmacyStats();
}
