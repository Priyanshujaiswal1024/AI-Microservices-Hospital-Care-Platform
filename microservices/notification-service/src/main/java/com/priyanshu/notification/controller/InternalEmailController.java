package com.priyanshu.notification.controller;

import com.priyanshu.notification.dto.EmailBookingRequest;
import com.priyanshu.notification.dto.EmailCancelRequest;
import com.priyanshu.notification.dto.EmailBillRequest;
import com.priyanshu.notification.dto.OtpRequest;
import com.priyanshu.notification.service.EmailService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

/**
 * ══════════════════════════════════════════════════════════════════
 * INTERNAL Synchronous Fallback Controller
 * ══════════════════════════════════════════════════════════════════
 *
 * This endpoint is called by OTHER SERVICES when Kafka is DOWN.
 * It is NOT exposed through the API Gateway (internal network only).
 * It bypasses the Kafka consumer and calls EmailService directly —
 * exactly like the old monolith's EmailService injection.
 *
 * When Kafka is UP   → events flow through KafkaConsumer → EmailService
 * When Kafka is DOWN → direct HTTP POST here → EmailService directly
 *
 * Endpoint Pattern: /internal/email/{type}
 * ══════════════════════════════════════════════════════════════════
 */
@Slf4j
@RestController
@RequestMapping("/internal/email")
@RequiredArgsConstructor
public class InternalEmailController {

    private final EmailService emailService;

    /** Called by appointment-service when Kafka is down (appointment.booked topic) */
    @PostMapping("/appointment-booked")
    public ResponseEntity<String> appointmentBooked(@RequestBody EmailBookingRequest req) {
        log.info("[SYNC FALLBACK] appointment-booked → sending directly to {}", req.getPatientEmail());
        emailService.sendAppointmentBooked(
                req.getPatientEmail(), req.getPatientName(),
                req.getDoctorName(), req.getAppointmentTime(), req.getReason()
        );
        return ResponseEntity.ok("Email queued");
    }

    /** Called by appointment-service when Kafka is down (appointment.cancelled topic) */
    @PostMapping("/appointment-cancelled")
    public ResponseEntity<String> appointmentCancelled(@RequestBody EmailCancelRequest req) {
        log.info("[SYNC FALLBACK] appointment-cancelled → sending directly to {}", req.getPatientEmail());
        emailService.sendAppointmentCancelled(
                req.getPatientEmail(), req.getPatientName(), req.getAppointmentTime()
        );
        return ResponseEntity.ok("Email queued");
    }

    /** Called by auth-service when Kafka is down (otp.send topic) */
    @PostMapping("/otp")
    public ResponseEntity<String> sendOtp(@RequestBody OtpRequest req) {
        log.info("[SYNC FALLBACK] otp.send → sending directly to {}", req.getEmail());
        emailService.sendOtp(req.getEmail(), req.getOtp());
        return ResponseEntity.ok("OTP email queued");
    }

    /** Called by billing-service when Kafka is down (bill.generated topic) */
    @PostMapping("/bill-generated")
    public ResponseEntity<String> billGenerated(@RequestBody EmailBillRequest req) {
        log.info("[SYNC FALLBACK] bill.generated → sending directly to {}", req.getPatientEmail());
        emailService.sendBillGenerated(
                req.getPatientEmail(), req.getPatientName(),
                req.getConsultationFee(), req.getGstAmount(),
                req.getTotalAmount(), req.getBillId()
        );
        return ResponseEntity.ok("Bill email queued");
    }
}
