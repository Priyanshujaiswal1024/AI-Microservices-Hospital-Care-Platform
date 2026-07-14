package com.priyanshu.pharmacy.service;

import com.priyanshu.pharmacy.dto.MedicineRequestDto;
import com.priyanshu.pharmacy.dto.MedicineResponseDto;
import com.priyanshu.pharmacy.entity.Medicine;
import com.priyanshu.pharmacy.repository.MedicineRepository;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.PageRequest;
import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class MedicineService {

    private final MedicineRepository medicineRepository;
    private final KafkaTemplate<String, Object> kafkaTemplate;

    private static final int LOW_STOCK_THRESHOLD = 10;

    // ── CREATE ───────────────────────────────────────────────────────────────
    @Transactional
    public MedicineResponseDto createMedicine(MedicineRequestDto dto) {
        Medicine medicine = Medicine.builder()
                .name(dto.getName())
                .category(dto.getCategory())
                .type(dto.getType())
                .dosage(dto.getDosage())
                .manufacturer(dto.getManufacturer())
                .price(dto.getPrice())
                .stock(dto.getStock())
                .build();

        Medicine saved = medicineRepository.save(medicine);
        checkAndPublishLowStock(saved);
        return toDto(saved);
    }

    // ── GET ALL (paginated) ──────────────────────────────────────────────────
    @Transactional(readOnly = true)
    public List<MedicineResponseDto> getAllMedicines(int page, int size) {
        return medicineRepository.findAll(PageRequest.of(page, size))
                .stream()
                .map(this::toDto)
                .toList();
    }

    // ── GET BY ID ────────────────────────────────────────────────────────────
    @Transactional(readOnly = true)
    public MedicineResponseDto getMedicineById(Long id) {
        return toDto(findById(id));
    }

    // ── SEARCH BY NAME ───────────────────────────────────────────────────────
    @Transactional(readOnly = true)
    public List<MedicineResponseDto> searchByName(String name) {
        return medicineRepository.findByNameContainingIgnoreCase(name)
                .stream()
                .map(this::toDto)
                .toList();
    }

    // ── UPDATE ───────────────────────────────────────────────────────────────
    @Transactional
    public MedicineResponseDto updateMedicine(Long id, MedicineRequestDto dto) {
        Medicine medicine = findById(id);
        medicine.setName(dto.getName());
        medicine.setCategory(dto.getCategory());
        medicine.setType(dto.getType());
        medicine.setDosage(dto.getDosage());
        medicine.setManufacturer(dto.getManufacturer());
        medicine.setPrice(dto.getPrice());
        medicine.setStock(dto.getStock());

        Medicine saved = medicineRepository.save(medicine);
        checkAndPublishLowStock(saved);
        return toDto(saved);
    }

    // ── DEDUCT STOCK (Called by clinical-service) ───────────────────────────
    @Transactional
    public MedicineResponseDto deductStock(Long id, int quantity) {
        Medicine medicine = findById(id);
        if (medicine.getStock() < quantity) {
            throw new RuntimeException("Insufficient stock for medicine: " + medicine.getName()
                    + ". Available: " + medicine.getStock() + ", Required: " + quantity);
        }
        medicine.setStock(medicine.getStock() - quantity);
        Medicine saved = medicineRepository.save(medicine);
        checkAndPublishLowStock(saved);
        return toDto(saved);
    }

    // ── DELETE ───────────────────────────────────────────────────────────────
    @Transactional
    public void deleteMedicine(Long id) {
        medicineRepository.delete(findById(id));
    }

    // ── LOW STOCK REPORT ─────────────────────────────────────────────────────
    @Transactional(readOnly = true)
    public List<MedicineResponseDto> getLowStockMedicines() {
        return medicineRepository.findByStockLessThanEqual(LOW_STOCK_THRESHOLD)
                .stream()
                .map(this::toDto)
                .toList();
    }

    // ── STATS (for admin dashboard) ──────────────────────────────────────────
    public Map<String, Long> getStats() {
        return Map.of(
                "totalMedicines", medicineRepository.count(),
                "lowStockCount", medicineRepository.countByStockLessThanEqual(LOW_STOCK_THRESHOLD)
        );
    }

    // ── PRIVATE HELPERS ──────────────────────────────────────────────────────
    private Medicine findById(Long id) {
        return medicineRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Medicine not found: " + id));
    }

    private void checkAndPublishLowStock(Medicine medicine) {
        if (medicine.getStock() != null && medicine.getStock() <= LOW_STOCK_THRESHOLD) {
            kafkaTemplate.send("pharmacy.low-stock",
                    Map.of("medicineId", medicine.getId(),
                           "medicineName", medicine.getName(),
                           "stock", medicine.getStock()));
        }
    }

    private MedicineResponseDto toDto(Medicine m) {
        MedicineResponseDto dto = new MedicineResponseDto();
        dto.setId(m.getId());
        dto.setName(m.getName());
        dto.setCategory(m.getCategory());
        dto.setType(m.getType());
        dto.setDosage(m.getDosage());
        dto.setManufacturer(m.getManufacturer());
        dto.setPrice(m.getPrice());
        dto.setStock(m.getStock());
        dto.setLowStock(m.getStock() != null && m.getStock() <= LOW_STOCK_THRESHOLD);
        return dto;
    }
}
