package com.priyanshu.clinical.service;

import com.lowagie.text.*;
import com.lowagie.text.pdf.PdfPCell;
import com.lowagie.text.pdf.PdfPTable;
import com.lowagie.text.pdf.PdfWriter;
import com.priyanshu.clinical.client.AppointmentClient;
import com.priyanshu.clinical.client.MedicineClient;
import com.priyanshu.clinical.client.PatientClient;
import com.priyanshu.clinical.dto.*;
import com.priyanshu.clinical.entity.Prescription;
import com.priyanshu.clinical.entity.PrescriptionMedicine;
import com.priyanshu.clinical.events.PrescriptionAddedEvent;
import com.priyanshu.clinical.repository.PrescriptionRepository;
import com.priyanshu.clinical.repository.MedicalRecordRepository;
import com.priyanshu.clinical.entity.MedicalRecord;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.io.ByteArrayOutputStream;
import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class PrescriptionService {

    private final PrescriptionRepository prescriptionRepository;
    private final MedicalRecordRepository medicalRecordRepository;
    private final AppointmentClient appointmentClient;
    private final MedicineClient medicineClient;
    private final PatientClient patientClient;
    private final KafkaTemplate<String, Object> kafkaTemplate;

    @Transactional
    public PrescriptionResponseDto createPrescription(Long appointmentId, CreatePrescriptionRequestDto requestDto) {
        // 1. Fetch appointment details via Feign client
        AppointmentClient.AppointmentResponseDto appointment = appointmentClient.getAppointmentById(appointmentId);

        // 2. Fetch patient summary (to get email/phone)
        PatientClient.PatientSummaryDto patient = patientClient.getPatientSummary(appointment.getPatientId());

        java.util.Optional<Prescription> existingOpt = prescriptionRepository.findByAppointmentId(appointmentId);
        Prescription prescription;
        boolean isUpdate = existingOpt.isPresent();

        if (isUpdate) {
            prescription = existingOpt.get();
            prescription.getMedicines().clear(); // Triggers orphan removal
            prescription.setDiagnosis(requestDto.getDiagnosis());
            prescription.setNotes(requestDto.getNotes());
        } else {
            // 3. Create Prescription entity
            prescription = Prescription.builder()
                    .appointmentId(appointmentId)
                    .patientId(appointment.getPatientId())
                    .doctorId(appointment.getDoctorId())
                    .patientName(appointment.getPatientName())
                    .patientEmail(patient.getEmail())
                    .doctorName(appointment.getDoctorName())
                    .diagnosis(requestDto.getDiagnosis())
                    .notes(requestDto.getNotes())
                    .build();
        }

        // 4. Process medicines and deduct stock
        List<PrescriptionMedicine> prescriptionMedicines = new ArrayList<>();
        List<PrescriptionAddedEvent.MedicineItem> eventMedicines = new ArrayList<>();

        if (requestDto.getMedicines() != null && !requestDto.getMedicines().isEmpty()) {
            for (MedicineItemDto item : requestDto.getMedicines()) {
                // Fetch medicine details to store snapshot
                MedicineClient.MedicineResponseDto medicine = medicineClient.getMedicineById(item.getMedicineId());

                // Deduct stock via Feign client
                medicineClient.deductStock(item.getMedicineId(), item.getQuantity());

                PrescriptionMedicine pm = PrescriptionMedicine.builder()
                        .prescription(prescription)
                        .medicineId(item.getMedicineId())
                        .medicineName(medicine.getName())
                        .frequency(item.getFrequency())
                        .durationDays(item.getDurationDays())
                        .quantity(item.getQuantity())
                        .instructions(item.getInstructions())
                        .build();

                prescriptionMedicines.add(pm);

                eventMedicines.add(new PrescriptionAddedEvent.MedicineItem(
                        medicine.getName(),
                        item.getFrequency(),
                        item.getDurationDays(),
                        item.getQuantity(),
                        item.getInstructions()
                ));
            }
            if (prescription.getMedicines() == null) {
                prescription.setMedicines(new ArrayList<>());
            }
            prescription.getMedicines().addAll(prescriptionMedicines);
        }

        Prescription saved = prescriptionRepository.save(prescription);

        // 5. Complete appointment via Feign (triggers completion & billing event)
        appointmentClient.completeAppointment(appointmentId);

        // 6. Publish prescription.added to Kafka for notification-service
        try {
            String mailDiagnosis = isUpdate ? "UPDATED: " + saved.getDiagnosis() : saved.getDiagnosis();
            PrescriptionAddedEvent event = new PrescriptionAddedEvent(
                    patient.getEmail(),
                    patient.getName(),
                    appointment.getDoctorName(),
                    mailDiagnosis,
                    eventMedicines
            );
            kafkaTemplate.send("prescription.added", event);
        } catch (Exception e) {
            log.error("Failed to publish prescription.added to Kafka: {}", e.getMessage());
        }

        return mapToResponseDto(saved);
    }

    public byte[] downloadPrescriptionPdf(Long id) throws Exception {
        Prescription prescription = prescriptionRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Prescription not found: " + id));
        return generatePrescriptionPdf(prescription);
    }

    public byte[] generatePrescriptionPdf(Prescription prescription) throws Exception {
        ByteArrayOutputStream out = new ByteArrayOutputStream();
        Document document = new Document(PageSize.A4, 50, 50, 60, 60);
        PdfWriter.getInstance(document, out);
        document.open();

        Font titleFont = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 20);
        Font headerFont = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 14);
        Font normalFont = FontFactory.getFont(FontFactory.HELVETICA, 11);
        Font smallFont = FontFactory.getFont(FontFactory.HELVETICA, 9);
        Font boldFont = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 11);
        Font tableHeader = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 10);

        Paragraph hospitalName = new Paragraph("City Care Hospital", titleFont);
        hospitalName.setAlignment(Element.ALIGN_CENTER);
        document.add(hospitalName);

        Paragraph hospitalAddress = new Paragraph("123 Health Street, Delhi | Ph: +91-11-XXXX-XXXX", normalFont);
        hospitalAddress.setAlignment(Element.ALIGN_CENTER);
        document.add(hospitalAddress);

        document.add(new Paragraph(" "));

        PdfPTable divider = new PdfPTable(1);
        divider.setWidthPercentage(100);
        PdfPCell divCell = new PdfPCell();
        divCell.setBackgroundColor(new java.awt.Color(41, 128, 185));
        divCell.setFixedHeight(3f);
        divCell.setBorder(Rectangle.NO_BORDER);
        divider.addCell(divCell);
        document.add(divider);

        document.add(new Paragraph(" "));

        Paragraph rxTitle = new Paragraph("PRESCRIPTION & CLINICAL SUMMARY", headerFont);
        rxTitle.setAlignment(Element.ALIGN_LEFT);
        document.add(rxTitle);

        document.add(new Paragraph(" "));

        PdfPTable infoTable = new PdfPTable(new float[]{1, 1});
        infoTable.setWidthPercentage(100);

        addInfoCell(infoTable, "Patient Name", prescription.getPatientName(), boldFont, normalFont);
        addInfoCell(infoTable, "Doctor Name", prescription.getDoctorName(), boldFont, normalFont);
        
        String date = "N/A";
        if (prescription.getCreatedAt() != null) {
            date = prescription.getCreatedAt().toLocalDate().toString();
        }
        addInfoCell(infoTable, "Date", date, boldFont, normalFont);
        addInfoCell(infoTable, "Appointment ID", String.valueOf(prescription.getAppointmentId()), boldFont, normalFont);

        document.add(infoTable);
        document.add(new Paragraph(" "));

        // Fetch matching medical record if any
        java.util.Optional<MedicalRecord> recordOpt = medicalRecordRepository.findByAppointmentId(prescription.getAppointmentId());
        if (recordOpt.isPresent()) {
            MedicalRecord record = recordOpt.get();
            document.add(new Paragraph("Clinical Diagnosis:", boldFont));
            Paragraph clinicalDiag = new Paragraph(record.getDiagnosis(), normalFont);
            clinicalDiag.setIndentationLeft(15f);
            document.add(clinicalDiag);
            
            document.add(new Paragraph(" "));
            
            if (record.getNotes() != null && !record.getNotes().isBlank()) {
                document.add(new Paragraph("Clinical Notes & Observations Summary:", boldFont));
                Paragraph clinicalNotes = new Paragraph(record.getNotes(), normalFont);
                clinicalNotes.setIndentationLeft(15f);
                document.add(clinicalNotes);
                document.add(new Paragraph(" "));
            }
        } else {
            document.add(new Paragraph("Diagnosis:", boldFont));
            Paragraph diagValue = new Paragraph(prescription.getDiagnosis(), normalFont);
            diagValue.setIndentationLeft(15f);
            document.add(diagValue);
            document.add(new Paragraph(" "));
        }

        document.add(new Paragraph("Prescribed Medicines:", boldFont));
        document.add(new Paragraph(" "));

        PdfPTable medTable = new PdfPTable(new float[]{2.5f, 1.5f, 1f, 0.8f, 2f});
        medTable.setWidthPercentage(100);

        String[] headers = {"Medicine", "Frequency", "Duration", "Qty", "Instructions"};
        for (String h : headers) {
            PdfPCell cell = new PdfPCell(new Paragraph(h, tableHeader));
            cell.setBackgroundColor(new java.awt.Color(41, 128, 185));
            cell.setPadding(6f);
            Font whiteFont = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 10, new java.awt.Color(255, 255, 255));
            cell.setPhrase(new Paragraph(h, whiteFont));
            medTable.addCell(cell);
        }

        List<PrescriptionMedicine> medicines = prescription.getMedicines();
        if (medicines != null && !medicines.isEmpty()) {
            boolean alternate = false;
            for (PrescriptionMedicine pm : medicines) {
                java.awt.Color rowColor = alternate ? new java.awt.Color(235, 245, 255) : java.awt.Color.WHITE;
                alternate = !alternate;

                addMedCell(medTable, pm.getMedicineName(), normalFont, rowColor);
                addMedCell(medTable, pm.getFrequency(), normalFont, rowColor);
                addMedCell(medTable, pm.getDurationDays() + " days", normalFont, rowColor);
                addMedCell(medTable, String.valueOf(pm.getQuantity()), normalFont, rowColor);
                addMedCell(medTable, pm.getInstructions() != null ? pm.getInstructions() : "—", normalFont, rowColor);
            }
        } else {
            PdfPCell emptyCell = new PdfPCell(new Paragraph("No medicines prescribed", smallFont));
            emptyCell.setColspan(5);
            emptyCell.setPadding(6f);
            medTable.addCell(emptyCell);
        }

        document.add(medTable);
        document.add(new Paragraph(" "));

        if (prescription.getNotes() != null && !prescription.getNotes().isBlank()) {
            document.add(new Paragraph("Notes:", boldFont));
            Paragraph notesVal = new Paragraph(prescription.getNotes(), normalFont);
            notesVal.setIndentationLeft(15f);
            document.add(notesVal);
            document.add(new Paragraph(" "));
        }

        document.add(new Paragraph(" "));
        document.add(new Paragraph(" "));

        PdfPTable sigTable = new PdfPTable(new float[]{1, 1});
        sigTable.setWidthPercentage(100);

        PdfPCell leftSig = new PdfPCell();
        leftSig.setBorder(Rectangle.NO_BORDER);
        leftSig.addElement(new Paragraph("Patient Signature: ____________________", normalFont));
        sigTable.addCell(leftSig);

        PdfPCell rightSig = new PdfPCell();
        rightSig.setBorder(Rectangle.NO_BORDER);
        rightSig.setHorizontalAlignment(Element.ALIGN_RIGHT);
        rightSig.addElement(new Paragraph("Doctor Signature: ____________________", normalFont));
        sigTable.addCell(rightSig);

        document.add(sigTable);
        document.add(new Paragraph(" "));

        Paragraph footer = new Paragraph("This is a computer-generated prescription. Valid only with doctor's stamp.", smallFont);
        footer.setAlignment(Element.ALIGN_CENTER);
        document.add(footer);

        document.close();
        return out.toByteArray();
    }

    @Transactional(readOnly = true)
    public PrescriptionResponseDto getPrescriptionByAppointmentId(Long appointmentId) {
        return prescriptionRepository.findByAppointmentId(appointmentId)
                .map(this::mapToResponseDto)
                .orElse(null);
    }

    @Transactional(readOnly = true)
    public List<PrescriptionResponseDto> getPrescriptionsForLoggedInPatient(String username) {
        List<Prescription> prescriptions = prescriptionRepository.findByPatientEmail(username);
        return prescriptions.stream()
                .map(this::mapToResponseDto)
                .collect(Collectors.toList());
    }

    private PrescriptionResponseDto mapToResponseDto(Prescription p) {
        List<PrescriptionMedicineResponseDto> medicineDtos = new ArrayList<>();
        if (p.getMedicines() != null) {
            medicineDtos = p.getMedicines().stream()
                    .map(pm -> PrescriptionMedicineResponseDto.builder()
                            .medicineId(pm.getMedicineId())
                            .medicineName(pm.getMedicineName())
                            .frequency(pm.getFrequency())
                            .durationDays(pm.getDurationDays())
                            .quantity(pm.getQuantity())
                            .instructions(pm.getInstructions())
                            .build())
                    .collect(Collectors.toList());
        }

        return PrescriptionResponseDto.builder()
                .id(p.getId())
                .diagnosis(p.getDiagnosis())
                .notes(p.getNotes())
                .medicines(medicineDtos)
                .appointmentId(p.getAppointmentId())
                .createdAt(p.getCreatedAt())
                .build();
    }

    private void addInfoCell(PdfPTable table, String label, String value, Font boldFont, Font normalFont) {
        PdfPCell cell = new PdfPCell();
        cell.setBorder(Rectangle.NO_BORDER);
        cell.setPaddingBottom(6f);
        cell.addElement(new Paragraph(label + ": ", boldFont));
        cell.addElement(new Paragraph(value != null ? value : "—", normalFont));
        table.addCell(cell);
    }

    private void addMedCell(PdfPTable table, String value, Font font, java.awt.Color bgColor) {
        PdfPCell cell = new PdfPCell(new Paragraph(value != null ? value : "—", font));
        cell.setPadding(5f);
        cell.setBackgroundColor(bgColor);
        table.addCell(cell);
    }
}
