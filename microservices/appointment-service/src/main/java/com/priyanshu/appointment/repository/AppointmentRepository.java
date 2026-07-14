package com.priyanshu.appointment.repository;

import com.priyanshu.appointment.entity.Appointment;
import com.priyanshu.appointment.entity.type.AppointmentStatus;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Repository
public interface AppointmentRepository extends JpaRepository<Appointment, Long> {

    List<Appointment> findByPatientId(Long patientId, Pageable pageable);

    List<Appointment> findByDoctorId(Long doctorId);

    List<Appointment> findByDoctorIdAndAppointmentTimeBetween(
            Long doctorId, java.time.LocalDateTime start, java.time.LocalDateTime end);

    Optional<Appointment> findByDoctorIdAndAppointmentTime(Long doctorId, LocalDateTime appointmentTime);

    List<Appointment> findByPatientIdAndAppointmentTimeAfterOrderByAppointmentTimeAsc(
            Long patientId, LocalDateTime after);

    List<Appointment> findByDoctorIdAndAppointmentTimeAfterOrderByAppointmentTimeAsc(
            Long doctorId, LocalDateTime after);

    long countByStatus(AppointmentStatus status);

    @Query("SELECT COUNT(a) FROM Appointment a WHERE a.appointmentTime >= :start AND a.appointmentTime < :end")
    long countTodayAppointments(LocalDateTime start, LocalDateTime end);

    long count();
}
