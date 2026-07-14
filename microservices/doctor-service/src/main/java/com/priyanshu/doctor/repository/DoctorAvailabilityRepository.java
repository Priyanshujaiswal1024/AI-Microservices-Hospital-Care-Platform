package com.priyanshu.doctor.repository;

import com.priyanshu.doctor.entity.DoctorAvailability;
import org.springframework.data.jpa.repository.JpaRepository;
import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

public interface DoctorAvailabilityRepository extends JpaRepository<DoctorAvailability, Long> {
    Optional<DoctorAvailability> findByDoctorIdAndDate(Long doctorId, LocalDate date);
    boolean existsByDoctorIdAndDate(Long doctorId, LocalDate date);
    List<DoctorAvailability> findByDoctorId(Long doctorId);
    List<DoctorAvailability> findByDoctorIdAndDateAfter(Long doctorId, LocalDate date);
}
