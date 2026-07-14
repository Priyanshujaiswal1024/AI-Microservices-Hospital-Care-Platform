package com.priyanshu.doctor.dto;

import lombok.Data;
import java.time.LocalDate;
import java.time.LocalTime;

@Data
public class DoctorAvailabilityRequestDto {
    private LocalDate date;
    private LocalTime startTime;
    private LocalTime endTime;
    private Integer maxSlots;
}
