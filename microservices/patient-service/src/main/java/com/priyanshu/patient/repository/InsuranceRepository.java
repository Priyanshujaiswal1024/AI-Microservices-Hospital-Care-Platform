package com.priyanshu.patient.repository;

import com.priyanshu.patient.entity.Insurance;
import com.priyanshu.patient.entity.Patient;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;

public interface InsuranceRepository extends JpaRepository<Insurance, Long> {
    boolean existsByPolicyNumber(String policyNumber);
    Optional<Insurance> findByPatient_Id(Long patientId);
    Optional<Insurance> findByPatient(Patient patient);
}
