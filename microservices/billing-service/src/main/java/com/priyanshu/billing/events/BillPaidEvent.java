package com.priyanshu.billing.events;

import com.fasterxml.jackson.annotation.JsonFormat;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

/** Published to Kafka topic: bill.paid → consumed by notification-service */
@Data @Builder @NoArgsConstructor @AllArgsConstructor
public class BillPaidEvent {
    private Long billId;
    private String patientEmail;
    private String patientName;
    private Double totalAmount;
    @JsonFormat(shape = JsonFormat.Shape.STRING, pattern = "yyyy-MM-dd'T'HH:mm:ss")
    private LocalDateTime paidAt;
}
