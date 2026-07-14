package com.priyanshu.clinical.ai;

import com.priyanshu.clinical.ai.client.AppointmentAiClient;
import com.priyanshu.clinical.ai.client.BillingAiClient;
import com.priyanshu.clinical.ai.client.DoctorAiClient;
import com.priyanshu.clinical.client.MedicineClient;
import com.priyanshu.clinical.entity.Prescription;
import com.priyanshu.clinical.entity.PrescriptionMedicine;
import com.priyanshu.clinical.repository.PrescriptionRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.ai.tool.annotation.Tool;
import org.springframework.stereotype.Component;

import java.util.List;
import java.util.stream.Collectors;

/**
 * Spring AI Tool Functions — Each method here becomes an AI Tool that the LLM
 * can call autonomously when the patient's query requires it.
 * All data is fetched LIVE from real databases — nothing is hardcoded.
 */
@Slf4j
@Component
@RequiredArgsConstructor
public class AiChatTools {

    private final DoctorAiClient doctorAiClient;
    private final BillingAiClient billingAiClient;
    private final AppointmentAiClient appointmentAiClient;
    private final MedicineClient medicineClient;
    private final PrescriptionRepository prescriptionRepository;

    // ─────────────────────────────────────────────────────────────────────────
    // TOOL 1: Doctors by Symptom / Specialization
    // ─────────────────────────────────────────────────────────────────────────
    @Tool(description = "Fetch doctors from the hospital database who match a given symptom, disease, or department keyword. For example: fever maps to General Medicine, heart to Cardiology. Returns doctor name, specialization, experience, consultation fee, and phone number. If no doctors found, returns a message saying no doctors available.")
    public String getDoctorsBySymptom(String symptomOrKeyword) {
        log.info("[AI Tool] getDoctorsBySymptom called with: {}", symptomOrKeyword);
        try {
            List<DoctorAiClient.DoctorDto> allDoctors = doctorAiClient.getAllDoctors();
            if (allDoctors == null || allDoctors.isEmpty()) {
                return "No doctors are currently registered in the hospital system.";
            }

            String keyword = symptomOrKeyword.toLowerCase();
            List<DoctorAiClient.DoctorDto> matched = allDoctors.stream()
                .filter(d -> {
                    String spec = d.getSpecialization() != null ? d.getSpecialization().toLowerCase() : "";
                    String bio = d.getBio() != null ? d.getBio().toLowerCase() : "";
                    
                    // Simple smart mapping from symptom to specialization
                    boolean smartMatch = false;
                    if (keyword.contains("heart") || keyword.contains("chest") || keyword.contains("cardio")) {
                        smartMatch = spec.contains("cardio");
                    } else if (keyword.contains("fever") || keyword.contains("headache") || keyword.contains("cold") || keyword.contains("cough") || keyword.contains("body")) {
                        smartMatch = spec.contains("general") || spec.contains("internal") || spec.contains("physician");
                    } else if (keyword.contains("bone") || keyword.contains("fracture") || keyword.contains("joint") || keyword.contains("pain")) {
                        smartMatch = spec.contains("ortho");
                    } else if (keyword.contains("skin") || keyword.contains("hair") || keyword.contains("rash")) {
                        smartMatch = spec.contains("derm");
                    } else if (keyword.contains("child") || keyword.contains("baby") || keyword.contains("kid")) {
                        smartMatch = spec.contains("pediatr");
                    } else if (keyword.contains("pregnancy") || keyword.contains("women")) {
                        smartMatch = spec.contains("gynaec") || spec.contains("gynec");
                    } else if (keyword.contains("brain") || keyword.contains("mind") || keyword.contains("nerve")) {
                        smartMatch = spec.contains("neuro") || spec.contains("psych");
                    }
                    
                    boolean nameMatch = d.getName() != null && d.getName().toLowerCase().contains(keyword);
                    boolean specMatch = spec.contains(keyword);
                    boolean deptMatch = d.getDepartments() != null
                        && d.getDepartments().stream().anyMatch(dept ->
                            dept.toLowerCase().contains(keyword));
                    boolean bioMatch  = bio.contains(keyword);
                    return specMatch || deptMatch || bioMatch || smartMatch || nameMatch;
                })
                .collect(Collectors.toList());

            if (matched.isEmpty()) {
                // Return all doctors with names when no specialization match
                return "No doctors found matching '" + symptomOrKeyword + "'. " +
                    "Here are all available doctors:\n" +
                    allDoctors.stream()
                        .map(d -> "• Dr. " + d.getName()
                            + " (" + d.getSpecialization() + ")"
                            + " | Fee: Rs." + d.getConsultationFee()
                            + " | Exp: " + d.getExperienceYears() + " yrs"
                            + " | Phone: " + d.getPhoneNumber())
                        .collect(Collectors.joining("\n"));
            }

            return "Doctors available for '" + symptomOrKeyword + "':\n" +
                matched.stream()
                    .map(d -> "• Dr. " + d.getName()
                        + " | Specialization: " + d.getSpecialization()
                        + " | Fee: Rs." + d.getConsultationFee()
                        + " | Experience: " + d.getExperienceYears() + " years"
                        + " | Phone: " + d.getPhoneNumber()
                        + " | Departments: " + d.getDepartments())
                    .collect(Collectors.joining("\n"));

        } catch (Exception e) {
            log.error("[AI Tool] getDoctorsBySymptom error", e);
            return "Unable to fetch doctor information at this time. Please try again later.";
        }
    }

    // ─────────────────────────────────────────────────────────────────────────
    // TOOL 2: All Doctors in Hospital
    // ─────────────────────────────────────────────────────────────────────────
    @Tool(description = "Fetch the complete list of all doctors registered in Priyansh Care Hospital. Use this when patient asks how many doctors are there or wants to list all doctors. Returns total count and names with specializations.")
    public String getAllDoctorsInHospital() {
        log.info("[AI Tool] getAllDoctorsInHospital called");
        try {
            List<DoctorAiClient.DoctorDto> doctors = doctorAiClient.getAllDoctors();
            if (doctors == null || doctors.isEmpty()) {
                return "There are currently no doctors registered in the hospital.";
            }
            return "Priyansh Care Hospital has " + doctors.size() + " doctors:\n" +
                doctors.stream()
                    .map(d -> "• Dr. " + d.getName()
                        + " - " + d.getSpecialization()
                        + " (" + d.getExperienceYears() + " yrs exp)"
                        + " | Fee: Rs." + d.getConsultationFee())
                    .collect(Collectors.joining("\n"));
        } catch (Exception e) {
            log.error("[AI Tool] getAllDoctorsInHospital error", e);
            return "Unable to fetch hospital doctor list at this time.";
        }
    }

    // ─────────────────────────────────────────────────────────────────────────
    // TOOL 3: Book Appointment
    // ─────────────────────────────────────────────────────────────────────────
    @Tool(description = "Book an appointment for the patient with a specific doctor. Use this when patient says book appointment with Dr. name at time on date. Parameters: patientId is the logged-in patient ID, doctorName is partial or full name, dateTime is in format yyyy-MM-dd HH:mm like 2025-07-09 10:00, reason is brief visit reason. Returns booking confirmation or error if doctor not found.")
    public String bookAppointment(Long patientId, String doctorName, String dateTime, String reason) {
        log.info("[AI Tool] bookAppointment: patientId={}, doctor={}, dateTime={}", patientId, doctorName, dateTime);
        try {
            List<DoctorAiClient.DoctorDto> doctors = doctorAiClient.getAllDoctors();
            DoctorAiClient.DoctorDto matched = doctors.stream()
                .filter(d -> d.getName() != null
                    && d.getName().toLowerCase().contains(doctorName.toLowerCase()))
                .findFirst()
                .orElse(null);

            if (matched == null) {
                return "Doctor '" + doctorName + "' not found in the hospital system. " +
                    "Please check the doctor name and try again.";
            }

            // Parse dateTime "yyyy-MM-dd HH:mm" -> "yyyy-MM-ddTHH:mm:ss"
            String isoDateTime = dateTime.trim().replace(" ", "T");
            if (isoDateTime.split(":").length == 2) {
                isoDateTime = isoDateTime + ":00";
            }

            AppointmentAiClient.BookRequest req = new AppointmentAiClient.BookRequest();
            req.setPatientId(patientId);
            req.setDoctorId(matched.getId());
            req.setAppointmentTime(isoDateTime);
            req.setReason(reason != null ? reason : "Consultation via AI Assistant");

            AppointmentAiClient.AppointmentConfirmDto confirm = appointmentAiClient.bookAppointment(req);

            return "Appointment Successfully Booked!\n" +
                "Appointment ID: #" + confirm.getId() + "\n" +
                "Doctor: Dr. " + confirm.getDoctorName() + "\n" +
                "Patient: " + confirm.getPatientName() + "\n" +
                "Date and Time: " + confirm.getAppointmentTime() + "\n" +
                "Status: " + confirm.getStatus() + "\n" +
                "Please arrive 10 minutes early. You will receive a confirmation notification.";

        } catch (Exception e) {
            log.error("[AI Tool] bookAppointment error", e);
            return "Unable to book appointment. Reason: " + e.getMessage() +
                ". Please try again or contact the hospital reception.";
        }
    }

    // ─────────────────────────────────────────────────────────────────────────
    // TOOL 4: Medicines by Symptom
    // ─────────────────────────────────────────────────────────────────────────
    @Tool(description = "Search available medicines in the hospital pharmacy for a given symptom, disease, or medicine category keyword. For example fever finds Paracetamol, pain finds Ibuprofen. Returns medicine name, category, price, and stock availability. Always adds disclaimer to consult doctor before medication.")
    public String getMedicinesBySymptom(String symptomOrCategory) {
        log.info("[AI Tool] getMedicinesBySymptom called with: {}", symptomOrCategory);
        try {
            List<MedicineClient.MedicineResponseDto> results =
                medicineClient.searchByName(symptomOrCategory);

            if (results == null || results.isEmpty()) {
                return "No medicines found in the pharmacy for '" + symptomOrCategory + "'. " +
                    "Please visit the pharmacy counter or ask your doctor for specific medication. " +
                    "Always consult your doctor before taking any medication.";
            }

            return "Medicines available in our pharmacy for '" + symptomOrCategory + "':\n" +
                results.stream()
                    .map(m -> "- " + m.getName()
                        + " | Category: " + m.getCategory()
                        + " | Price: Rs." + m.getPrice()
                        + " | Stock: " + (m.getStock() > 0
                            ? m.getStock() + " units available" : "OUT OF STOCK"))
                    .collect(Collectors.joining("\n")) +
                "\n\nAlways consult your doctor before taking any medication.";

        } catch (Exception e) {
            log.error("[AI Tool] getMedicinesBySymptom error", e);
            return "Unable to fetch pharmacy data at this time. Please visit the pharmacy counter.";
        }
    }

    // ─────────────────────────────────────────────────────────────────────────
    // TOOL 5: My Prescriptions
    // ─────────────────────────────────────────────────────────────────────────
    @Tool(description = "Retrieve all prescriptions for the currently logged-in patient from the hospital database. Use this when patient asks show my prescriptions, what medicines were prescribed, or my last prescription. Parameter patientId is the logged-in patient ID. Returns prescriptions with diagnosis, doctor name, medicines, and date. If no prescriptions found says patient has no prescriptions.")
    public String getMyPrescriptions(Long patientId) {
        log.info("[AI Tool] getMyPrescriptions called for patientId={}", patientId);
        try {
            List<Prescription> prescriptions = prescriptionRepository.findByPatientId(patientId);
            if (prescriptions == null || prescriptions.isEmpty()) {
                return "No prescriptions found for your account. " +
                    "Prescriptions are created after a doctor completes your appointment.";
            }
            return "Your Prescriptions (" + prescriptions.size() + " total):\n\n" +
                prescriptions.stream()
                    .map(p -> "Prescription #" + p.getId() + "\n" +
                        "  Doctor: Dr. " + p.getDoctorName() + "\n" +
                        "  Diagnosis: " + p.getDiagnosis() + "\n" +
                        "  Date: " + (p.getCreatedAt() != null
                            ? p.getCreatedAt().toLocalDate().toString() : "N/A") + "\n" +
                        "  Notes: " + (p.getNotes() != null ? p.getNotes() : "None") + "\n" +
                        "  Medicines: " + formatMedicines(p.getMedicines()))
                    .collect(Collectors.joining("\n\n"));
        } catch (Exception e) {
            log.error("[AI Tool] getMyPrescriptions error", e);
            return "Unable to fetch prescriptions. Please try again or visit the clinical desk.";
        }
    }

    // ─────────────────────────────────────────────────────────────────────────
    // TOOL 6: My Bills
    // ─────────────────────────────────────────────────────────────────────────
    @Tool(description = "Retrieve all billing records for the currently logged-in patient. Use this when patient asks show my bill, how much do I owe, payment status, my pending bills, or how much was charged. Parameter patientId is the logged-in patient ID. Returns bill amounts, status PENDING or PAID, doctor name, and dates. If no bills found says patient has no billing records.")
    public String getMyBills(Long patientId) {
        log.info("[AI Tool] getMyBills called for patientId={}", patientId);
        try {
            List<BillingAiClient.BillDto> bills = billingAiClient.getBillsByPatient(patientId);
            if (bills == null || bills.isEmpty()) {
                return "No billing records found for your account.";
            }

            double totalPending = bills.stream()
                .filter(b -> "PENDING".equalsIgnoreCase(b.getStatus()))
                .mapToDouble(b -> b.getTotalAmount() != null ? b.getTotalAmount() : 0)
                .sum();

            return "Your Bills (" + bills.size() + " total) | Pending: Rs." + String.format("%.2f", totalPending) + "\n\n" +
                bills.stream()
                    .map(b -> "Bill #" + b.getId() + "\n" +
                        "  Doctor: Dr. " + b.getDoctorName() + "\n" +
                        "  Consultation: Rs." + b.getConsultationFee() + "\n" +
                        "  GST: Rs." + b.getGstAmount() + "\n" +
                        "  Total: Rs." + b.getTotalAmount() + "\n" +
                        "  Status: " + (b.getStatus() != null ? b.getStatus() : "UNKNOWN") + "\n" +
                        "  Date: " + b.getCreatedAt())
                    .collect(Collectors.joining("\n\n"));
        } catch (Exception e) {
            log.error("[AI Tool] getMyBills error", e);
            return "Unable to fetch billing information. Please contact the billing desk.";
        }
    }

    // ─────────────────────────────────────────────────────────────────────────
    // TOOL 7: Doctor Availability Slots
    // ─────────────────────────────────────────────────────────────────────────
    public String getDoctorAvailability(String doctorName) {
        log.info("[AI Tool] getDoctorAvailability called for doctorName={}", doctorName);
        try {
            List<DoctorAiClient.DoctorDto> doctors = doctorAiClient.getAllDoctors();
            DoctorAiClient.DoctorDto matched = doctors.stream()
                .filter(d -> d.getName() != null
                    && d.getName().toLowerCase().contains(doctorName.toLowerCase()))
                .findFirst()
                .orElse(null);

            if (matched == null) {
                return "Doctor '" + doctorName + "' not found in the hospital system.";
            }

            List<DoctorAiClient.AvailabilityDto> slots = doctorAiClient.getDoctorAvailabilities(matched.getId());
            if (slots == null || slots.isEmpty()) {
                return "Dr. " + matched.getName() + " has no scheduled availability slots in the database right now.";
            }

            return "Dr. " + matched.getName() + " is available on these upcoming dates:\n" +
                slots.stream()
                    .map(s -> "• " + s.getDate() + " | Time: " + s.getStartTime() + " to " + s.getEndTime()
                        + " (" + (s.getMaxSlots() - s.getBookedSlots()) + " slots left)")
                    .collect(Collectors.joining("\n")) +
                "\n\nAap isme se koi bhi date select karke booking request kar sakte hain! (e.g. 'Book Dr. Mehta at 10:00 on 2026-07-09')";

        } catch (Exception e) {
            log.error("[AI Tool] getDoctorAvailability error", e);
            return "Unable to fetch doctor availability slots at this time.";
        }
    }

    // ─────────────────────────────────────────────────────────────────────────
    // PRIVATE HELPERS
    // ─────────────────────────────────────────────────────────────────────────

    private String formatMedicines(List<PrescriptionMedicine> medicines) {
        if (medicines == null || medicines.isEmpty()) return "None specified";
        return medicines.stream()
            .map(m -> m.getMedicineName() + " x" + m.getQuantity()
                + (m.getInstructions() != null ? " (" + m.getInstructions() + ")" : "")
                + (m.getFrequency() != null ? " - " + m.getFrequency() : ""))
            .collect(Collectors.joining(", "));
    }
}
