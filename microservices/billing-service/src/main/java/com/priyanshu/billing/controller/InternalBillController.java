package com.priyanshu.billing.controller;

import com.priyanshu.billing.dto.BillResponseDto;
import com.priyanshu.billing.service.BillService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/internal")
@RequiredArgsConstructor
public class InternalBillController {

    private final BillService billService;

    @GetMapping("/patient/{patientId}")
    public ResponseEntity<List<BillResponseDto>> getBillsByPatientId(@PathVariable("patientId") Long patientId) {
        return ResponseEntity.ok(billService.getBillsForPatient(patientId));
    }
}
