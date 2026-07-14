package com.priyanshu.admin.client;

import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.GetMapping;

import java.util.Map;

@FeignClient(name = "billing-stats", url = "${billing.service.url}")
public interface BillingStatsClient {
    @GetMapping("/api/v1/bills/stats")
    Map<String, Object> getBillingStats();
}
