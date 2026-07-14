package com.priyanshu.notification.events;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * Published by billing-service when a bill is generated.
 * Kafka Topic: bill.generated
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
@com.fasterxml.jackson.annotation.JsonIgnoreProperties(ignoreUnknown = true)
public class BillGeneratedEvent {
    private Long billId;
    private String patientEmail;
    private String patientName;
    private Double consultationFee;
    private Double gstAmount;
    private Double totalAmount;
}
