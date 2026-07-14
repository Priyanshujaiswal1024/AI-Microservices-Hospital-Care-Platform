package com.priyanshu.admin.controller;

import com.priyanshu.admin.client.*;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/v1/admin")
@RequiredArgsConstructor
public class AdminDashboardController {

    private final DoctorStatsClient doctorStatsClient;
    private final PatientStatsClient patientStatsClient;
    private final AppointmentStatsClient appointmentStatsClient;
    private final BillingStatsClient billingStatsClient;
    private final PharmacyStatsClient pharmacyStatsClient;

    /**
     * GET /api/v1/admin/dashboard
     * Aggregates stats from all 5 microservices in parallel (via Feign).
     * ADMIN only.
     */
    @GetMapping("/dashboard")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Map<String, Object>> getDashboard() {
        Map<String, Object> dashboard = new HashMap<>();

        // Aggregate from all services — each is an independent HTTP call
        try { dashboard.putAll(doctorStatsClient.getDoctorStats()); }
        catch (Exception e) { dashboard.put("doctorStatsError", e.getMessage()); }

        try { dashboard.putAll(patientStatsClient.getPatientStats()); }
        catch (Exception e) { dashboard.put("patientStatsError", e.getMessage()); }

        try { dashboard.putAll(appointmentStatsClient.getAppointmentStats()); }
        catch (Exception e) { dashboard.put("appointmentStatsError", e.getMessage()); }

        try { dashboard.putAll(billingStatsClient.getBillingStats()); }
        catch (Exception e) { dashboard.put("billingStatsError", e.getMessage()); }

        try { dashboard.putAll(pharmacyStatsClient.getPharmacyStats()); }
        catch (Exception e) { dashboard.put("pharmacyStatsError", e.getMessage()); }

        return ResponseEntity.ok(dashboard);
    }
}
