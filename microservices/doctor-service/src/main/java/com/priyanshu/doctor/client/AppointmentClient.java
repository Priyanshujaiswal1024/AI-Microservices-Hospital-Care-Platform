package com.priyanshu.doctor.client;

import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestParam;
import java.time.LocalTime;
import java.util.List;

@FeignClient(name = "appointment-service", url = "${appointment.service.url}")
public interface AppointmentClient {

    @GetMapping("/api/v1/appointments/internal/booked-slots")
    List<LocalTime> getBookedSlots(
            @RequestParam("doctorId") Long doctorId,
            @RequestParam("start") String start,
            @RequestParam("end") String end
    );
}
