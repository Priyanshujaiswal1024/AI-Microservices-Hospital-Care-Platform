package com.priyanshu.notification.events;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

/**
 * Published by clinical-service when a prescription is added.
 * Kafka Topic: prescription.added
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
@com.fasterxml.jackson.annotation.JsonIgnoreProperties(ignoreUnknown = true)
public class PrescriptionAddedEvent {
    private String patientEmail;
    private String patientName;
    private String doctorName;
    private String diagnosis;
    private List<MedicineItem> medicines;

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @com.fasterxml.jackson.annotation.JsonIgnoreProperties(ignoreUnknown = true)
    public static class MedicineItem {
        private String medicineName;
        private String frequency;
        private Integer durationDays;
        private Integer quantity;
        private String instructions;
    }
}
