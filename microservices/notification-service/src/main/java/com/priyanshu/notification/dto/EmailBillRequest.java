package com.priyanshu.notification.dto;

import lombok.Data;

@Data
public class EmailBillRequest {
    private Long billId;
    private String patientEmail;
    private String patientName;
    private Double consultationFee;
    private Double gstAmount;
    private Double totalAmount;
}
