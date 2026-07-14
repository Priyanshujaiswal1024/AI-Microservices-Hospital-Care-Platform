package com.priyanshu.clinical.events;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class PrescriptionAddedEvent {
    private String patientEmail;
    private String patientName;
    private String doctorName;
    private String diagnosis;
    private List<MedicineItem> medicines;

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class MedicineItem {
        private String medicineName;
        private String frequency;
        private Integer durationDays;
        private Integer quantity;
        private String instructions;
    }
}
