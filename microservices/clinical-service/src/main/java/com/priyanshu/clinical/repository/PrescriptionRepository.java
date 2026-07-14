package com.priyanshu.clinical.repository;

import com.priyanshu.clinical.entity.Prescription;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface PrescriptionRepository extends JpaRepository<Prescription, Long> {
    List<Prescription> findByPatientId(Long patientId);
    List<Prescription> findByPatientEmail(String patientEmail);
    java.util.Optional<Prescription> findByAppointmentId(Long appointmentId);
    boolean existsByAppointmentId(Long appointmentId);
}
