package com.priyanshu.billing.events;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/** Published to Kafka topic: bill.generated → consumed by notification-service */
@Data @Builder @NoArgsConstructor @AllArgsConstructor
public class BillGeneratedEvent {
    private Long billId;
    private String patientEmail;
    private String patientName;
    private Double consultationFee;
    private Double gstAmount;
    private Double totalAmount;
}
