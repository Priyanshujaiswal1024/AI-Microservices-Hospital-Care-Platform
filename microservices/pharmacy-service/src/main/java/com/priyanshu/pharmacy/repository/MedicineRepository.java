package com.priyanshu.pharmacy.repository;

import com.priyanshu.pharmacy.entity.Medicine;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface MedicineRepository extends JpaRepository<Medicine, Long> {
    Page<Medicine> findAll(Pageable pageable);
    List<Medicine> findByNameContainingIgnoreCase(String name);
    long countByStockLessThanEqual(int threshold);
    List<Medicine> findByStockLessThanEqual(int threshold);
}
