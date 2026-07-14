package com.priyanshu.billing.repository;

import com.priyanshu.billing.entity.Bill;
import com.priyanshu.billing.entity.type.BillStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface BillRepository extends JpaRepository<Bill, Long> {
    boolean existsByAppointmentId(Long appointmentId);
    List<Bill> findByPatientId(Long patientId);
    long countByStatus(BillStatus status);

    @Query("SELECT SUM(b.totalAmount) FROM Bill b WHERE b.status = 'PAID'")
    Double getTotalRevenue();
}
