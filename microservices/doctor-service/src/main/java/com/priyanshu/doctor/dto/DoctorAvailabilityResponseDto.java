package com.priyanshu.doctor.dto;

import lombok.Data;
import java.time.LocalDate;
import java.time.LocalTime;

@Data
public class DoctorAvailabilityResponseDto {
    private Long id;
    private LocalDate date;
    private LocalTime startTime;
    private LocalTime endTime;
    private Integer maxSlots;
    private Integer bookedSlots;
}
