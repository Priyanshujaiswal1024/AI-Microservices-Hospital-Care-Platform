package com.priyanshu.notification.consumer;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.priyanshu.notification.events.*;
import com.priyanshu.notification.service.EmailService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.kafka.annotation.KafkaListener;
import org.springframework.stereotype.Component;

/**
 * Central Kafka consumer — listens on all notification-related topics.
 *
 * Topics published by other services:
 *  - appointment.booked        → appointment-service
 *  - appointment.cancelled     → appointment-service
 *  - bill.generated            → billing-service
 *  - bill.paid                 → billing-service
 *  - otp.send                  → auth-service
 *  - doctor.welcome            → doctor-service
 *  - prescription.added        → clinical-service
 */
@Slf4j
@Component
@RequiredArgsConstructor
public class NotificationConsumer {

    private final EmailService emailService;
    private final ObjectMapper objectMapper;

    // ── Appointment Booked ───────────────────────────────────────────────────
    @KafkaListener(topics = "appointment.booked", groupId = "notification-group",
            containerFactory = "kafkaListenerContainerFactory")
    public void onAppointmentBooked(String message) {
        try {
            AppointmentBookedEvent event = objectMapper.readValue(message, AppointmentBookedEvent.class);
            log.info("[Kafka] appointment.booked received for appointmentId={}", event.getAppointmentId());
            emailService.sendAppointmentBooked(
                    event.getPatientEmail(),
                    event.getPatientName(),
                    event.getDoctorName(),
                    event.getAppointmentTime(),
                    event.getReason()
            );
        } catch (Exception e) {
            log.error("[Kafka] Failed to process appointment.booked: {}", e.getMessage());
        }
    }

    // ── Appointment Cancelled ────────────────────────────────────────────────
    @KafkaListener(topics = "appointment.cancelled", groupId = "notification-group",
            containerFactory = "kafkaListenerContainerFactory")
    public void onAppointmentCancelled(String message) {
        try {
            AppointmentCancelledEvent event = objectMapper.readValue(message, AppointmentCancelledEvent.class);
            log.info("[Kafka] appointment.cancelled received for appointmentId={}", event.getAppointmentId());
            emailService.sendAppointmentCancelled(
                    event.getPatientEmail(),
                    event.getPatientName(),
                    event.getAppointmentTime()
            );
        } catch (Exception e) {
            log.error("[Kafka] Failed to process appointment.cancelled: {}", e.getMessage());
        }
    }

    // ── Bill Generated ───────────────────────────────────────────────────────
    @KafkaListener(topics = "bill.generated", groupId = "notification-group",
            containerFactory = "kafkaListenerContainerFactory")
    public void onBillGenerated(String message) {
        try {
            BillGeneratedEvent event = objectMapper.readValue(message, BillGeneratedEvent.class);
            log.info("[Kafka] bill.generated received for billId={}", event.getBillId());
            emailService.sendBillGenerated(
                    event.getPatientEmail(),
                    event.getPatientName(),
                    event.getConsultationFee(),
                    event.getGstAmount(),
                    event.getTotalAmount(),
                    event.getBillId()
            );
        } catch (Exception e) {
            log.error("[Kafka] Failed to process bill.generated: {}", e.getMessage());
        }
    }

    // ── Bill Paid ────────────────────────────────────────────────────────────
    @KafkaListener(topics = "bill.paid", groupId = "notification-group",
            containerFactory = "kafkaListenerContainerFactory")
    public void onBillPaid(String message) {
        try {
            BillPaidEvent event = objectMapper.readValue(message, BillPaidEvent.class);
            log.info("[Kafka] bill.paid received for billId={}", event.getBillId());
            emailService.sendPaymentConfirmation(
                    event.getPatientEmail(),
                    event.getPatientName(),
                    event.getTotalAmount(),
                    event.getBillId(),
                    event.getPaidAt()
            );
        } catch (Exception e) {
            log.error("[Kafka] Failed to process bill.paid: {}", e.getMessage());
        }
    }

    // ── OTP Send ─────────────────────────────────────────────────────────────
    @KafkaListener(topics = "otp.send", groupId = "notification-group",
            containerFactory = "kafkaListenerContainerFactory")
    public void onOtpSend(String message) {
        try {
            OtpSendEvent event = objectMapper.readValue(message, OtpSendEvent.class);
            log.info("[Kafka] otp.send received for email={}, purpose={}", event.getEmail(), event.getPurpose());
            emailService.sendOtp(event.getEmail(), event.getOtp());
        } catch (Exception e) {
            log.error("[Kafka] Failed to process otp.send: {}", e.getMessage());
        }
    }

    // ── Doctor Welcome ───────────────────────────────────────────────────────
    @KafkaListener(topics = "doctor.welcome", groupId = "notification-group",
            containerFactory = "kafkaListenerContainerFactory")
    public void onDoctorWelcome(String message) {
        try {
            DoctorWelcomeEvent event = objectMapper.readValue(message, DoctorWelcomeEvent.class);
            log.info("[Kafka] doctor.welcome received for email={}", event.getDoctorEmail());
            emailService.sendDoctorWelcome(
                    event.getDoctorEmail(),
                    event.getDoctorName(),
                    event.getTempPassword()
            );
        } catch (Exception e) {
            log.error("[Kafka] Failed to process doctor.welcome: {}", e.getMessage());
        }
    }

    // ── Prescription Added ───────────────────────────────────────────────────
    @KafkaListener(topics = "prescription.added", groupId = "notification-group",
            containerFactory = "kafkaListenerContainerFactory")
    public void onPrescriptionAdded(String message) {
        try {
            PrescriptionAddedEvent event = objectMapper.readValue(message, PrescriptionAddedEvent.class);
            log.info("[Kafka] prescription.added received for patient={}", event.getPatientEmail());
            emailService.sendPrescriptionAdded(
                    event.getPatientEmail(),
                    event.getPatientName(),
                    event.getDoctorName(),
                    event.getDiagnosis(),
                    event.getMedicines()
            );
        } catch (Exception e) {
            log.error("[Kafka] Failed to process prescription.added: {}", e.getMessage());
        }
    }
}
