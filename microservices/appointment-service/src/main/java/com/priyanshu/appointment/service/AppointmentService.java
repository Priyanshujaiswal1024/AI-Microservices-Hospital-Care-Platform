package com.priyanshu.appointment.service;

import com.priyanshu.appointment.client.DoctorClient;
import com.priyanshu.appointment.client.NotificationFallbackClient;
import com.priyanshu.appointment.client.PatientClient;
import com.priyanshu.appointment.dto.AppointmentRequestDto;
import com.priyanshu.appointment.dto.AppointmentResponseDto;
import com.priyanshu.appointment.dto.external.DoctorSummaryDto;
import com.priyanshu.appointment.dto.external.PatientSummaryDto;
import com.priyanshu.appointment.dto.notification.EmailBookingRequest;
import com.priyanshu.appointment.dto.notification.EmailCancelRequest;
import com.priyanshu.appointment.entity.Appointment;
import com.priyanshu.appointment.entity.type.AppointmentStatus;
import com.priyanshu.appointment.events.AppointmentBookedEvent;
import com.priyanshu.appointment.events.AppointmentCancelledEvent;
import com.priyanshu.appointment.events.AppointmentCompletedEvent;
import com.priyanshu.appointment.kafka.ResilientKafkaPublisher;
import com.priyanshu.appointment.repository.AppointmentRepository;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

@Slf4j
@Service
@RequiredArgsConstructor
public class AppointmentService {

    private final AppointmentRepository appointmentRepository;
    private final DoctorClient doctorClient;
    private final PatientClient patientClient;
    private final ResilientKafkaPublisher kafkaPublisher;
    private final NotificationFallbackClient notificationFallbackClient;

    // ── CREATE APPOINTMENT ────────────────────────────────────────────────────
    @Transactional
    public AppointmentResponseDto createAppointment(AppointmentRequestDto dto, Long userId) {

        // 1. Fetch patient from patient-service
        PatientSummaryDto patient = patientClient.getPatientSummary(userId);

        // 2. Fetch doctor from doctor-service
        DoctorSummaryDto doctor = doctorClient.getDoctorSummary(dto.getDoctorId());

        // 3. Check doctor availability
        String dateStr = dto.getAppointmentTime().toLocalDate().toString();
        boolean available = doctorClient.isDoctorAvailableOnDate(dto.getDoctorId(), dateStr);
        if (!available) {
            throw new RuntimeException("Doctor is not available on this date");
        }

        // 4. Check slot not already booked
        appointmentRepository.findByDoctorIdAndAppointmentTime(dto.getDoctorId(), dto.getAppointmentTime())
                .ifPresent(a -> { throw new RuntimeException("This slot is already booked"); });

        // 5. Create appointment with denormalized snapshots
        Appointment appointment = Appointment.builder()
                .patientId(userId)
                .doctorId(dto.getDoctorId())
                .patientName(patient.getName())
                .patientEmail(patient.getEmail())
                .doctorName(doctor.getName())
                .consultationFee(doctor.getConsultationFee())
                .appointmentTime(dto.getAppointmentTime())
                .reason(dto.getReason())
                .status(AppointmentStatus.BOOKED)
                .build();

        Appointment saved = appointmentRepository.save(appointment);

        // 6. Publish Kafka event → notification-service sends booking email
        //    If Kafka is DOWN → falls back to direct REST call (sync like old monolith)
        AppointmentBookedEvent bookedEvent = AppointmentBookedEvent.builder()
                .appointmentId(saved.getId())
                .patientEmail(patient.getEmail())
                .patientName(patient.getName())
                .doctorName(doctor.getName())
                .appointmentTime(saved.getAppointmentTime())
                .reason(saved.getReason())
                .build();

        kafkaPublisher.publishOrFallback(
                "appointment.booked",
                bookedEvent,
                () -> notificationFallbackClient.sendBookingConfirmation(
                        new EmailBookingRequest(
                                patient.getEmail(), patient.getName(),
                                doctor.getName(), saved.getAppointmentTime(),
                                saved.getReason()
                        )
                )
        );
        log.info("[Event] appointment.booked dispatched: appointmentId={}", saved.getId());

        return toResponseDto(saved);
    }

    // ── CANCEL APPOINTMENT ────────────────────────────────────────────────────
    @Transactional
    public void cancelAppointment(Long appointmentId) {
        Appointment appointment = findById(appointmentId);

        if (appointment.getStatus() == AppointmentStatus.CANCELLED) {
            throw new RuntimeException("Already cancelled");
        }
        if (appointment.getStatus() == AppointmentStatus.COMPLETED) {
            throw new RuntimeException("Cannot cancel a completed appointment");
        }

        appointment.setStatus(AppointmentStatus.CANCELLED);
        appointmentRepository.save(appointment);

        // Publish Kafka event → notification-service
        //    If Kafka is DOWN → falls back to direct REST call
        AppointmentCancelledEvent cancelledEvent = AppointmentCancelledEvent.builder()
                .appointmentId(appointment.getId())
                .patientEmail(appointment.getPatientEmail())
                .patientName(appointment.getPatientName())
                .appointmentTime(appointment.getAppointmentTime())
                .build();

        kafkaPublisher.publishOrFallback(
                "appointment.cancelled",
                cancelledEvent,
                () -> notificationFallbackClient.sendCancellationEmail(
                        new EmailCancelRequest(
                                appointment.getPatientEmail(),
                                appointment.getPatientName(),
                                appointment.getAppointmentTime()
                        )
                )
        );
        log.info("[Event] appointment.cancelled dispatched: appointmentId={}", appointmentId);
    }

    // ── MARK COMPLETED ────────────────────────────────────────────────────────
    @Transactional
    public AppointmentResponseDto markCompleted(Long appointmentId) {
        Appointment appointment = findById(appointmentId);

        if (appointment.getStatus() == AppointmentStatus.COMPLETED) {
            AppointmentCompletedEvent completedEvent = AppointmentCompletedEvent.builder()
                    .appointmentId(appointment.getId())
                    .patientId(appointment.getPatientId())
                    .doctorId(appointment.getDoctorId())
                    .patientName(appointment.getPatientName())
                    .patientEmail(appointment.getPatientEmail())
                    .doctorName(appointment.getDoctorName())
                    .consultationFee(appointment.getConsultationFee())
                    .build();

            kafkaPublisher.publishOrFallback(
                    "appointment.completed",
                    completedEvent,
                    () -> log.warn("[Fallback] Kafka down — billing/clinical must be triggered manually for appointmentId={}",
                            appointmentId)
            );
            return toResponseDto(appointment);
        }

        appointment.setStatus(AppointmentStatus.COMPLETED);
        appointmentRepository.save(appointment);

        // Publish Kafka event → billing-service + clinical-service
        //    If Kafka is DOWN → billing and clinical won't auto-trigger
        //    (admin can manually mark bill / add prescription — acceptable degradation)
        AppointmentCompletedEvent completedEvent = AppointmentCompletedEvent.builder()
                .appointmentId(appointment.getId())
                .patientId(appointment.getPatientId())
                .doctorId(appointment.getDoctorId())
                .patientName(appointment.getPatientName())
                .patientEmail(appointment.getPatientEmail())
                .doctorName(appointment.getDoctorName())
                .consultationFee(appointment.getConsultationFee())
                .build();

        kafkaPublisher.publishOrFallback(
                "appointment.completed",
                completedEvent,
                () -> log.warn("[Fallback] Kafka down — billing/clinical must be triggered manually for appointmentId={}",
                        appointmentId)
        );
        log.info("[Event] appointment.completed dispatched: appointmentId={}", appointmentId);

        return toResponseDto(appointment);
    }

    // ── REASSIGN DOCTOR ───────────────────────────────────────────────────────
    @Transactional
    public AppointmentResponseDto reassignDoctor(Long appointmentId, Long newDoctorId) {
        Appointment appointment = findById(appointmentId);
        DoctorSummaryDto newDoctor = doctorClient.getDoctorSummary(newDoctorId);

        appointment.setDoctorId(newDoctorId);
        appointment.setDoctorName(newDoctor.getName());
        appointment.setConsultationFee(newDoctor.getConsultationFee());

        return toResponseDto(appointmentRepository.save(appointment));
    }

    // ── GET BY PATIENT ────────────────────────────────────────────────────────
    @Transactional(readOnly = true)
    public List<AppointmentResponseDto> getAppointmentsForPatient(Long patientId, int page, int size) {
        return appointmentRepository.findByPatientId(patientId, PageRequest.of(page, size))
                .stream().map(this::toResponseDto).toList();
    }

    // ── GET BY DOCTOR ─────────────────────────────────────────────────────────
    @Transactional(readOnly = true)
    public List<AppointmentResponseDto> getAppointmentsForDoctor(Long doctorId) {
        return appointmentRepository.findByDoctorId(doctorId)
                .stream().map(this::toResponseDto).toList();
    }

    // ── UPCOMING FOR PATIENT ──────────────────────────────────────────────────
    @Transactional(readOnly = true)
    public List<AppointmentResponseDto> getUpcomingForPatient(Long patientId) {
        return appointmentRepository
                .findByPatientIdAndAppointmentTimeAfterOrderByAppointmentTimeAsc(patientId, LocalDateTime.now())
                .stream().map(this::toResponseDto).toList();
    }

    // ── UPCOMING FOR DOCTOR ───────────────────────────────────────────────────
    @Transactional(readOnly = true)
    public List<AppointmentResponseDto> getUpcomingForDoctor(Long doctorId) {
        return appointmentRepository
                .findByDoctorIdAndAppointmentTimeAfterOrderByAppointmentTimeAsc(doctorId, LocalDateTime.now())
                .stream().map(this::toResponseDto).toList();
    }

    // ── GET SINGLE ────────────────────────────────────────────────────────────
    @Transactional(readOnly = true)
    public AppointmentResponseDto getAppointmentById(Long id) {
        return toResponseDto(findById(id));
    }

    // ── STATS FOR DASHBOARD ──────────────────────────────────────────────────
    @Transactional(readOnly = true)
    public long getStatsCount() {
        return appointmentRepository.count();
    }

    @Transactional(readOnly = true)
    public long getTodayCount() {
        java.time.LocalDate today = java.time.LocalDate.now();
        return appointmentRepository.countTodayAppointments(
                today.atStartOfDay(),
                today.plusDays(1).atStartOfDay()
        );
    }

    @Transactional(readOnly = true)
    public List<java.time.LocalTime> getBookedSlotsForDoctor(
            Long doctorId, java.time.LocalDateTime start, java.time.LocalDateTime end) {
        return appointmentRepository.findByDoctorIdAndAppointmentTimeBetween(doctorId, start, end)
                .stream()
                .map(a -> a.getAppointmentTime().toLocalTime())
                .collect(java.util.stream.Collectors.toList());
    }

    // ── PRIVATE HELPERS ───────────────────────────────────────────────────────
    private Appointment findById(Long id) {
        return appointmentRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Appointment not found: " + id));
    }

    private AppointmentResponseDto toResponseDto(Appointment a) {
        AppointmentResponseDto dto = new AppointmentResponseDto();
        dto.setId(a.getId());
        dto.setPatientId(a.getPatientId());
        dto.setDoctorId(a.getDoctorId());
        dto.setPatientName(a.getPatientName());
        dto.setDoctorName(a.getDoctorName());
        dto.setAppointmentTime(a.getAppointmentTime());
        dto.setReason(a.getReason());
        dto.setStatus(a.getStatus().name());
        dto.setCreatedAt(a.getCreatedAt());
        return dto;
    }
}
