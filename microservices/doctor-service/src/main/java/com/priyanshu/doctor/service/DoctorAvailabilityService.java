package com.priyanshu.doctor.service;

import com.priyanshu.doctor.client.AppointmentClient;
import com.priyanshu.doctor.dto.AvailableSlotDto;
import com.priyanshu.doctor.entity.DoctorAvailability;
import com.priyanshu.doctor.repository.DoctorAvailabilityRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.ArrayList;
import java.util.List;

@Service
@RequiredArgsConstructor
public class DoctorAvailabilityService {

    private final DoctorAvailabilityRepository doctorAvailabilityRepository;
    private final AppointmentClient appointmentClient;

    private static final int SLOT_DURATION = 30;

    @Transactional(readOnly = true)
    public List<AvailableSlotDto> getAvailableSlots(Long doctorId, LocalDate date) {
        DoctorAvailability availability = doctorAvailabilityRepository
                .findByDoctorIdAndDate(doctorId, date)
                .orElseThrow(() -> new RuntimeException("Doctor not available on this date"));

        List<AvailableSlotDto> allSlots = generateSlots(availability.getStartTime(), availability.getEndTime());

        LocalDateTime startDateTime = date.atTime(availability.getStartTime());
        LocalDateTime endDateTime = date.atTime(availability.getEndTime());

        // Fetch booked slots from appointment-service via Feign
        List<LocalTime> bookedSlots = appointmentClient.getBookedSlots(
                doctorId,
                startDateTime.toString(),
                endDateTime.toString()
        );

        // Remove booked slots
        allSlots.removeIf(slot -> bookedSlots.contains(slot.getStartTime()));

        // Remove past slots if date is today
        if (date.equals(LocalDate.now())) {
            LocalTime now = LocalTime.now();
            allSlots.removeIf(slot -> slot.getStartTime().isBefore(now));
        }

        return allSlots;
    }

    private List<AvailableSlotDto> generateSlots(LocalTime startTime, LocalTime endTime) {
        List<AvailableSlotDto> slots = new ArrayList<>();
        LocalTime current = startTime;

        while (current.plusMinutes(SLOT_DURATION).isBefore(endTime)
                || current.plusMinutes(SLOT_DURATION).equals(endTime)) {

            slots.add(new AvailableSlotDto(
                    current,
                    current.plusMinutes(SLOT_DURATION)
            ));

            current = current.plusMinutes(SLOT_DURATION);
        }

        return slots;
    }
}
