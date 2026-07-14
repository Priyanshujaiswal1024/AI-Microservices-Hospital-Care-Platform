package com.priyanshu.billing.service;

import com.lowagie.text.*;
import com.lowagie.text.pdf.*;
import com.priyanshu.billing.dto.BillResponseDto;
import com.priyanshu.billing.entity.Bill;
import com.priyanshu.billing.entity.type.BillStatus;
import com.priyanshu.billing.events.AppointmentCompletedEvent;
import com.priyanshu.billing.events.BillGeneratedEvent;
import com.priyanshu.billing.events.BillPaidEvent;
import com.priyanshu.billing.repository.BillRepository;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.io.ByteArrayOutputStream;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.Map;

@Slf4j
@Service
@RequiredArgsConstructor
public class BillService {

    private final BillRepository billRepository;
    private final KafkaTemplate<String, Object> kafkaTemplate;

    private static final double GST_RATE = 0.18;
    private static final DateTimeFormatter DATE_FMT = DateTimeFormatter.ofPattern("dd MMM yyyy, hh:mm a");

    // ── AUTO-GENERATE BILL (from Kafka event) ──────────────────────────────
    @Transactional
    public BillResponseDto generateBillFromEvent(AppointmentCompletedEvent event) {
        if (billRepository.existsByAppointmentId(event.getAppointmentId())) {
            log.warn("Bill already exists for appointmentId={}", event.getAppointmentId());
            return null;
        }

        double consultationFee = event.getConsultationFee() != null ? event.getConsultationFee() : 0.0;
        double gst = Math.round(consultationFee * GST_RATE * 100.0) / 100.0;
        double total = Math.round((consultationFee + gst) * 100.0) / 100.0;

        Bill bill = Bill.builder()
                .appointmentId(event.getAppointmentId())
                .patientId(event.getPatientId())
                .doctorId(event.getDoctorId())
                .patientName(event.getPatientName())
                .patientEmail(event.getPatientEmail())
                .doctorName(event.getDoctorName())
                .consultationFee(consultationFee)
                .gstAmount(gst)
                .totalAmount(total)
                .status(BillStatus.UNPAID)
                .createdAt(LocalDateTime.now())
                .build();

        Bill saved = billRepository.save(bill);

        // Publish bill.generated → notification-service
        kafkaTemplate.send("bill.generated",
                BillGeneratedEvent.builder()
                        .billId(saved.getId())
                        .patientEmail(saved.getPatientEmail())
                        .patientName(saved.getPatientName())
                        .consultationFee(saved.getConsultationFee())
                        .gstAmount(saved.getGstAmount())
                        .totalAmount(saved.getTotalAmount())
                        .build());

        log.info("[Kafka] bill.generated published: billId={}", saved.getId());
        return toDto(saved);
    }

    // ── MARK PAID ────────────────────────────────────────────────────────────
    @Transactional
    public BillResponseDto markAsPaid(Long billId) {
        Bill bill = findById(billId);

        if (bill.getStatus() == BillStatus.PAID) {
            throw new RuntimeException("Bill " + billId + " is already paid");
        }

        bill.setStatus(BillStatus.PAID);
        bill.setPaidAt(LocalDateTime.now());
        billRepository.save(bill);

        // Publish bill.paid → notification-service
        kafkaTemplate.send("bill.paid",
                BillPaidEvent.builder()
                        .billId(bill.getId())
                        .patientEmail(bill.getPatientEmail())
                        .patientName(bill.getPatientName())
                        .totalAmount(bill.getTotalAmount())
                        .paidAt(bill.getPaidAt())
                        .build());

        log.info("[Kafka] bill.paid published: billId={}", billId);
        return toDto(bill);
    }

    // ── GET BILLS FOR PATIENT ─────────────────────────────────────────────────
    @Transactional(readOnly = true)
    public List<BillResponseDto> getBillsForPatient(Long patientId) {
        return billRepository.findByPatientId(patientId)
                .stream().map(this::toDto).toList();
    }

    // ── GET ALL BILLS (for admin) ─────────────────────────────────────────────
    @Transactional(readOnly = true)
    public List<BillResponseDto> getAllBills() {
        return billRepository.findAll()
                .stream().map(this::toDto).toList();
    }

    // ── GET SINGLE BILL ───────────────────────────────────────────────────────
    @Transactional(readOnly = true)
    public BillResponseDto getBillById(Long billId) {
        return toDto(findById(billId));
    }

    // ── STATS (for admin dashboard) ───────────────────────────────────────────
    public Map<String, Object> getStats() {
        Double revenue = billRepository.getTotalRevenue();
        return Map.of(
                "totalRevenue", revenue != null ? revenue : 0.0,
                "unpaidBillCount", billRepository.countByStatus(BillStatus.UNPAID)
        );
    }

    // ── GENERATE PDF INVOICE ──────────────────────────────────────────────────
    @Transactional(readOnly = true)
    public byte[] generateInvoicePdf(Long billId) throws Exception {
        Bill bill = findById(billId);
        ByteArrayOutputStream out = new ByteArrayOutputStream();
        Document document = new Document(PageSize.A4, 50, 50, 60, 60);
        PdfWriter.getInstance(document, out);
        document.open();

        Font titleFont  = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 22);
        Font boldFont   = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 11);
        Font normalFont = FontFactory.getFont(FontFactory.HELVETICA, 11);
        Font smallFont  = FontFactory.getFont(FontFactory.HELVETICA, 9);
        Font thFont     = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 10, new java.awt.Color(255, 255, 255));
        Font greenFont  = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 16, new java.awt.Color(39, 174, 96));
        Font redFont    = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 16, new java.awt.Color(192, 57, 43));

        java.awt.Color accentColor = new java.awt.Color(41, 128, 185);
        java.awt.Color altRowColor = new java.awt.Color(235, 245, 255);

        Paragraph hospitalName = new Paragraph("City Care Hospital", titleFont);
        hospitalName.setAlignment(Element.ALIGN_CENTER);
        document.add(hospitalName);

        Paragraph hospitalAddress = new Paragraph(
                "123 Health Street, Delhi | Ph: +91-11-XXXX-XXXX | GST: 07XXXXX1234Z5", normalFont);
        hospitalAddress.setAlignment(Element.ALIGN_CENTER);
        document.add(hospitalAddress);

        document.add(new Paragraph(" "));

        PdfPTable infoTable = new PdfPTable(new float[]{1, 1});
        infoTable.setWidthPercentage(100);
        addInfoCell(infoTable, "Patient Name", bill.getPatientName(), boldFont, normalFont);
        addInfoCell(infoTable, "Bill Date", bill.getCreatedAt().format(DATE_FMT), boldFont, normalFont);
        addInfoCell(infoTable, "Doctor Name", bill.getDoctorName(), boldFont, normalFont);
        addInfoCell(infoTable, "Bill #", String.format("INV-%05d", bill.getId()), boldFont, normalFont);
        addInfoCell(infoTable, "Status", bill.getStatus().name(), boldFont, normalFont);
        document.add(infoTable);
        document.add(new Paragraph(" "));

        PdfPTable billingTable = new PdfPTable(new float[]{3, 1.5f, 1.5f});
        billingTable.setWidthPercentage(100);
        for (String h : new String[]{"Description", "Rate", "Amount"}) {
            PdfPCell cell = new PdfPCell(new Paragraph(h, thFont));
            cell.setBackgroundColor(accentColor);
            cell.setPadding(7f);
            billingTable.addCell(cell);
        }
        addBillingRow(billingTable, "Consultation Fee",
                "₹" + String.format("%.2f", bill.getConsultationFee()),
                "₹" + String.format("%.2f", bill.getConsultationFee()),
                normalFont, java.awt.Color.WHITE);
        addBillingRow(billingTable, "GST (18%)", "18%",
                "₹" + String.format("%.2f", bill.getGstAmount()),
                normalFont, altRowColor);
        document.add(billingTable);
        document.add(new Paragraph(" "));

        boolean isPaid = bill.getStatus() == BillStatus.PAID;
        Paragraph statusStamp = new Paragraph(isPaid ? "✓ PAID" : "⚠ PAYMENT PENDING",
                isPaid ? greenFont : redFont);
        statusStamp.setAlignment(Element.ALIGN_CENTER);
        document.add(statusStamp);

        document.close();
        return out.toByteArray();
    }

    // ── PRIVATE ───────────────────────────────────────────────────────────────
    private Bill findById(Long id) {
        return billRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Bill not found: " + id));
    }

    private BillResponseDto toDto(Bill b) {
        BillResponseDto dto = new BillResponseDto();
        dto.setId(b.getId());
        dto.setAppointmentId(b.getAppointmentId());
        dto.setPatientName(b.getPatientName());
        dto.setDoctorName(b.getDoctorName());
        dto.setConsultationFee(b.getConsultationFee());
        dto.setGstAmount(b.getGstAmount());
        dto.setTotalAmount(b.getTotalAmount());
        dto.setStatus(b.getStatus().name());
        dto.setCreatedAt(b.getCreatedAt());
        dto.setPaidAt(b.getPaidAt());
        return dto;
    }

    private void addInfoCell(PdfPTable table, String label, String value, Font boldFont, Font normalFont) {
        PdfPCell cell = new PdfPCell();
        cell.setBorder(Rectangle.NO_BORDER);
        cell.setPaddingBottom(6f);
        cell.addElement(new Paragraph(label + ":", boldFont));
        cell.addElement(new Paragraph(value != null ? value : "—", normalFont));
        table.addCell(cell);
    }

    private void addBillingRow(PdfPTable table, String desc, String rate,
                               String amount, Font font, java.awt.Color bg) {
        for (String val : new String[]{desc, rate, amount}) {
            PdfPCell cell = new PdfPCell(new Paragraph(val, font));
            cell.setPadding(6f);
            cell.setBackgroundColor(bg);
            table.addCell(cell);
        }
    }
}
