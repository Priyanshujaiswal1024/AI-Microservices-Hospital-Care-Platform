package com.priyanshu.billing.controller;

import com.priyanshu.billing.dto.BillResponseDto;
import com.priyanshu.billing.service.BillService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/v1/bills")
@RequiredArgsConstructor
public class BillController {

    private final BillService billService;

    @GetMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<BillResponseDto>> getAllBills() {
        return ResponseEntity.ok(billService.getAllBills());
    }

    /** GET /api/v1/bills/patient — PATIENT gets their own bills */
    @GetMapping("/patient")
    @PreAuthorize("hasRole('PATIENT')")
    public ResponseEntity<List<BillResponseDto>> getMyBills(
            @RequestAttribute("userId") Long userId) {
        return ResponseEntity.ok(billService.getBillsForPatient(userId));
    }

    /** GET /api/v1/bills/{id} */
    @GetMapping("/{id}")
    public ResponseEntity<BillResponseDto> getBillById(@PathVariable Long id) {
        return ResponseEntity.ok(billService.getBillById(id));
    }

    /** PATCH /api/v1/bills/{id}/mark-paid — ADMIN only */
    @PatchMapping("/{id}/mark-paid")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<BillResponseDto> markPaid(@PathVariable Long id) {
        return ResponseEntity.ok(billService.markAsPaid(id));
    }

    /** GET /api/v1/bills/{id}/download — PDF Invoice */
    @GetMapping("/{id}/download")
    @PreAuthorize("hasAnyRole('PATIENT','ADMIN')")
    public ResponseEntity<byte[]> downloadInvoice(@PathVariable Long id) throws Exception {
        byte[] pdf = billService.generateInvoicePdf(id);
        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION,
                        "attachment; filename=invoice-" + id + ".pdf")
                .contentType(MediaType.APPLICATION_PDF)
                .body(pdf);
    }

    /** GET /api/v1/bills/stats — ADMIN only */
    @GetMapping("/stats")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Map<String, Object>> getStats() {
        return ResponseEntity.ok(billService.getStats());
    }
}
