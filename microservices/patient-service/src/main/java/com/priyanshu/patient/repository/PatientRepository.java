package com.priyanshu.patient.repository;

import com.priyanshu.patient.entity.Patient;
import com.priyanshu.patient.entity.type.BloodGroupType;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

public interface PatientRepository extends JpaRepository<Patient, Long> {

    Optional<Patient> findByEmail(String email);

    Optional<Patient> findByName(String name);

    List<Patient> findByNameContainingOrderByIdDesc(String query);

    List<Patient> findByBirthDateBetween(LocalDate startDate, LocalDate endDate);

    @Query("SELECT p FROM Patient p WHERE p.bloodGroup = :bloodGroup")
    List<Patient> findByBloodGroup(@Param("bloodGroup") BloodGroupType bloodGroup);

    @Query("SELECT p.bloodGroup, COUNT(p) FROM Patient p GROUP BY p.bloodGroup")
    List<Object[]> countEachBloodGroupType();

    @Query("SELECT p FROM Patient p WHERE p.birthDate > :birthDate")
    List<Patient> findByBornAfterDate(@Param("birthDate") LocalDate birthDate);

    @Query("SELECT p FROM Patient p")
    Page<Patient> findAllPatients(Pageable pageable);

    @Transactional
    @Modifying
    @Query("UPDATE Patient p SET p.name = :name WHERE p.id = :id")
    int updateNameWithId(@Param("name") String name, @Param("id") Long id);
}
