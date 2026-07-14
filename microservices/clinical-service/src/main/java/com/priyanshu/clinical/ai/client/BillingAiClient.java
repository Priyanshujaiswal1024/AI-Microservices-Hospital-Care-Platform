package com.priyanshu.clinical.ai.client;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import lombok.Data;
import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;

import java.util.List;

@FeignClient(name = "billing-ai-client", url = "${billing.service.url}")
public interface BillingAiClient {

    @GetMapping("/internal/patient/{patientId}")
    List<BillDto> getBillsByPatient(@PathVariable("patientId") Long patientId);

    @Data
    @JsonIgnoreProperties(ignoreUnknown = true)
    class BillDto {
        private Long id;
        private Long appointmentId;
        private String patientName;
        private String doctorName;
        private Double consultationFee;
        private Double gstAmount;
        private Double totalAmount;
        private String status;
        private String createdAt;
        private String paidAt;
    }
}
