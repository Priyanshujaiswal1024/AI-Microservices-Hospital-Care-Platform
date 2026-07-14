package com.priyanshu.clinical.service;

import com.lowagie.text.*;
import com.lowagie.text.pdf.PdfPCell;
import com.lowagie.text.pdf.PdfPTable;
import com.lowagie.text.pdf.PdfWriter;
import com.priyanshu.clinical.client.AppointmentClient;
import com.priyanshu.clinical.client.PatientClient;
import com.priyanshu.clinical.dto.CreateMedicalRecordRequestDto;
import com.priyanshu.clinical.dto.MedicalRecordResponseDto;
import com.priyanshu.clinical.entity.MedicalRecord;
import com.priyanshu.clinical.entity.Prescription;
import com.priyanshu.clinical.entity.PrescriptionMedicine;
import com.priyanshu.clinical.repository.MedicalRecordRepository;
import com.priyanshu.clinical.repository.PrescriptionRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.io.ByteArrayOutputStream;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class MedicalRecordService {

    private final MedicalRecordRepository medicalRecordRepository;
    private final PrescriptionRepository prescriptionRepository;
    private final AppointmentClient appointmentClient;
    private final PatientClient patientClient;

    private static final DateTimeFormatter DATE_FMT =
            DateTimeFormatter.ofPattern("dd MMM yyyy, hh:mm a");

    @Transactional
    public MedicalRecordResponseDto createMedicalRecord(CreateMedicalRecordRequestDto requestDto) {
        java.util.Optional<MedicalRecord> existingOpt = medicalRecordRepository.findByAppointmentId(requestDto.getAppointmentId());
        MedicalRecord record;
        if (existingOpt.isPresent()) {
            record = existingOpt.get();
            record.setDiagnosis(requestDto.getDiagnosis());
            record.setNotes(requestDto.getNotes());
            if (requestDto.getPrescriptionId() != null) {
                record.setPrescriptionId(requestDto.getPrescriptionId());
            }
        } else {
            // Fetch appointment details via Feign
            AppointmentClient.AppointmentResponseDto appointment = appointmentClient.getAppointmentById(requestDto.getAppointmentId());

            // Build medical record
            record = MedicalRecord.builder()
                    .appointmentId(appointment.getId())
                    .patientId(appointment.getPatientId())
                    .doctorId(appointment.getDoctorId())
                    .patientName(appointment.getPatientName())
                    .doctorName(appointment.getDoctorName())
                    .diagnosis(requestDto.getDiagnosis())
                    .notes(requestDto.getNotes())
                    .visitDate(LocalDateTime.now())
                    .build();

            if (requestDto.getPrescriptionId() != null) {
                prescriptionRepository.findById(requestDto.getPrescriptionId())
                        .ifPresent(p -> record.setPrescriptionId(p.getId()));
            }
        }

        MedicalRecord saved = medicalRecordRepository.save(record);
        log.info("Medical record saved/updated for appointment: {}", requestDto.getAppointmentId());

        // Mark appointment as COMPLETED via Feign (auto-generates bill via Kafka)
        appointmentClient.completeAppointment(requestDto.getAppointmentId());

        return mapToDto(saved);
    }

    @Transactional(readOnly = true)
    public MedicalRecordResponseDto getMedicalRecordByAppointmentId(Long appointmentId) {
        return medicalRecordRepository.findByAppointmentId(appointmentId)
                .map(this::mapToDto)
                .orElse(null);
    }

    @Transactional(readOnly = true)
    public List<MedicalRecordResponseDto> getMedicalRecordsForLoggedInPatient(Long patientId) {
        return medicalRecordRepository.findByPatientId(patientId)
                .stream()
                .map(this::mapToDto)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public byte[] downloadMedicalRecordPdf(Long recordId, Long patientId) throws Exception {
        MedicalRecord record = medicalRecordRepository.findById(recordId)
                .orElseThrow(() -> new RuntimeException("Medical record not found: " + recordId));

        if (!record.getPatientId().equals(patientId) && !record.getDoctorId().equals(patientId)) {
            throw new RuntimeException("Access denied: you do not have permission to view this record.");
        }

        return generateMedicalRecordPdf(record);
    }

    private byte[] generateMedicalRecordPdf(MedicalRecord record) throws Exception {
        ByteArrayOutputStream out = new ByteArrayOutputStream();
        Document document = new Document(PageSize.A4, 50, 50, 60, 60);
        PdfWriter.getInstance(document, out);
        document.open();

        Font titleFont = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 20);
        Font headFont = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 13);
        Font boldFont = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 11);
        Font normalFont = FontFactory.getFont(FontFactory.HELVETICA, 11);
        Font smallFont = FontFactory.getFont(FontFactory.HELVETICA, 9);
        Font whiteFont = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 10, new java.awt.Color(255, 255, 255));

        java.awt.Color accent = new java.awt.Color(39, 174, 96);
        java.awt.Color altRow = new java.awt.Color(235, 250, 240);

        Paragraph hospitalName = new Paragraph("City Care Hospital", titleFont);
        hospitalName.setAlignment(Element.ALIGN_CENTER);
        document.add(hospitalName);

        Paragraph hospitalAddress = new Paragraph("123 Health Street, Delhi | Ph: +91-11-XXXX-XXXX", normalFont);
        hospitalAddress.setAlignment(Element.ALIGN_CENTER);
        document.add(hospitalAddress);

        document.add(new Paragraph(" "));
        addDivider(document, accent);
        document.add(new Paragraph(" "));

        Paragraph title = new Paragraph("MEDICAL RECORD", headFont);
        title.setAlignment(Element.ALIGN_LEFT);
        document.add(title);

        Paragraph recordNum = new Paragraph("Record ID: MR-" + String.format("%05d", record.getId()), normalFont);
        document.add(recordNum);
        document.add(new Paragraph(" "));

        PdfPTable infoTable = new PdfPTable(new float[]{1, 1});
        infoTable.setWidthPercentage(100);

        addInfoCell(infoTable, "Patient Name", record.getPatientName(), boldFont, normalFont);
        addInfoCell(infoTable, "Visit Date", record.getVisitDate() != null ? record.getVisitDate().format(DATE_FMT) : "—", boldFont, normalFont);
        addInfoCell(infoTable, "Doctor Name", record.getDoctorName(), boldFont, normalFont);
        addInfoCell(infoTable, "Appointment ID", String.valueOf(record.getAppointmentId()), boldFont, normalFont);

        document.add(infoTable);
        document.add(new Paragraph(" "));

        document.add(sectionHeader("Diagnosis", accent));
        document.add(new Paragraph(" "));
        Paragraph diagPara = new Paragraph(record.getDiagnosis() != null ? record.getDiagnosis() : "—", normalFont);
        diagPara.setIndentationLeft(15f);
        document.add(diagPara);
        document.add(new Paragraph(" "));

        document.add(sectionHeader("Clinical Notes", accent));
        document.add(new Paragraph(" "));
        Paragraph notesPara = new Paragraph(record.getNotes() != null ? record.getNotes() : "—", normalFont);
        notesPara.setIndentationLeft(15f);
        document.add(notesPara);
        document.add(new Paragraph(" "));

        if (record.getPrescriptionId() != null) {
            Prescription rx = prescriptionRepository.findById(record.getPrescriptionId()).orElse(null);
            if (rx != null) {
                document.add(sectionHeader("Prescribed Medicines", accent));
                document.add(new Paragraph(" "));

                PdfPTable medTable = new PdfPTable(new float[]{2.5f, 1.5f, 1f, 0.8f, 2f});
                medTable.setWidthPercentage(100);

                for (String h : new String[]{"Medicine", "Frequency", "Duration", "Qty", "Instructions"}) {
                    PdfPCell hCell = new PdfPCell(new Paragraph(h, whiteFont));
                    hCell.setBackgroundColor(accent);
                    hCell.setPadding(6f);
                    medTable.addCell(hCell);
                }

                List<PrescriptionMedicine> meds = rx.getMedicines();
                if (meds != null && !meds.isEmpty()) {
                    boolean alt = false;
                    for (PrescriptionMedicine pm : meds) {
                        java.awt.Color rowColor = alt ? altRow : java.awt.Color.WHITE;
                        alt = !alt;
                        addMedCell(medTable, pm.getMedicineName(), normalFont, rowColor);
                        addMedCell(medTable, pm.getFrequency(), normalFont, rowColor);
                        addMedCell(medTable, pm.getDurationDays() + " days", normalFont, rowColor);
                        addMedCell(medTable, String.valueOf(pm.getQuantity()), normalFont, rowColor);
                        addMedCell(medTable, pm.getInstructions() != null ? pm.getInstructions() : "—", normalFont, rowColor);
                    }
                } else {
                    PdfPCell empty = new PdfPCell(new Paragraph("No medicines listed", smallFont));
                    empty.setColspan(5);
                    empty.setPadding(6f);
                    medTable.addCell(empty);
                }

                document.add(medTable);
                document.add(new Paragraph(" "));
            }
        }

        document.add(new Paragraph(" "));

        PdfPTable sigTable = new PdfPTable(new float[]{1, 1});
        sigTable.setWidthPercentage(100);

        PdfPCell leftSig = new PdfPCell();
        leftSig.setBorder(Rectangle.NO_BORDER);
        leftSig.addElement(new Paragraph("Patient Signature: ____________________", normalFont));
        sigTable.addCell(leftSig);

        PdfPCell rightSig = new PdfPCell();
        rightSig.setBorder(Rectangle.NO_BORDER);
        rightSig.addElement(new Paragraph("Doctor Signature: ____________________", normalFont));
        rightSig.setHorizontalAlignment(Element.ALIGN_RIGHT);
        sigTable.addCell(rightSig);

        document.add(sigTable);
        document.add(new Paragraph(" "));

        Paragraph footer = new Paragraph("Confidential Medical Record — City Care Hospital. Issued on "
                + LocalDateTime.now().format(DATE_FMT), smallFont);
        footer.setAlignment(Element.ALIGN_CENTER);
        document.add(footer);

        document.close();
        return out.toByteArray();
    }

    private MedicalRecordResponseDto mapToDto(MedicalRecord r) {
        return MedicalRecordResponseDto.builder()
                .id(r.getId())
                .diagnosis(r.getDiagnosis())
                .notes(r.getNotes())
                .patientId(r.getPatientId())
                .doctorId(r.getDoctorId())
                .appointmentId(r.getAppointmentId())
                .prescriptionId(r.getPrescriptionId())
                .visitDate(r.getVisitDate())
                .patientName(r.getPatientName())
                .doctorName(r.getDoctorName())
                .build();
    }

    private Paragraph sectionHeader(String text, java.awt.Color color) {
        Font f = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 12);
        f.setColor(color);
        return new Paragraph(text, f);
    }

    private void addInfoCell(PdfPTable table, String label, String value, Font boldFont, Font normalFont) {
        PdfPCell cell = new PdfPCell();
        cell.setBorder(Rectangle.NO_BORDER);
        cell.setPaddingBottom(6f);
        cell.addElement(new Paragraph(label + ":", boldFont));
        cell.addElement(new Paragraph(value != null ? value : "—", normalFont));
        table.addCell(cell);
    }

    private void addMedCell(PdfPTable table, String value, Font font, java.awt.Color bg) {
        PdfPCell cell = new PdfPCell(new Paragraph(value != null ? value : "—", font));
        cell.setPadding(5f);
        cell.setBackgroundColor(bg);
        table.addCell(cell);
    }

    private void addDivider(Document doc, java.awt.Color color) throws DocumentException {
        PdfPTable divider = new PdfPTable(1);
        divider.setWidthPercentage(100);
        PdfPCell cell = new PdfPCell();
        cell.setBackgroundColor(color);
        cell.setFixedHeight(3f);
        cell.setBorder(Rectangle.NO_BORDER);
        divider.addCell(cell);
        doc.add(divider);
    }
}
