package com.priyanshu.clinical.repository;

import com.priyanshu.clinical.entity.MedicalRecord;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface MedicalRecordRepository extends JpaRepository<MedicalRecord, Long> {
    List<MedicalRecord> findByPatientId(Long patientId);
    java.util.Optional<MedicalRecord> findByAppointmentId(Long appointmentId);
    boolean existsByAppointmentId(Long appointmentId);
}
