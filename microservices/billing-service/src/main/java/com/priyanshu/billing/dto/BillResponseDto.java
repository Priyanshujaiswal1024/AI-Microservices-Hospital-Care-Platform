package com.priyanshu.billing.dto;

import com.fasterxml.jackson.annotation.JsonFormat;
import lombok.Data;

import java.time.LocalDateTime;

@Data
public class BillResponseDto {
    private Long id;
    private Long appointmentId;
    private String patientName;
    private String doctorName;
    private Double consultationFee;
    private Double gstAmount;
    private Double totalAmount;
    private String status;
    @JsonFormat(shape = JsonFormat.Shape.STRING, pattern = "yyyy-MM-dd'T'HH:mm:ss")
    private LocalDateTime createdAt;
    @JsonFormat(shape = JsonFormat.Shape.STRING, pattern = "yyyy-MM-dd'T'HH:mm:ss")
    private LocalDateTime paidAt;
}
