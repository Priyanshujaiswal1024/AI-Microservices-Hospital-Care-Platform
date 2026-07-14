package com.priyanshu.clinical.ai;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.priyanshu.clinical.ai.client.AppointmentAiClient;
import com.priyanshu.clinical.client.MedicineClient;
import com.priyanshu.clinical.dto.CreatePrescriptionRequestDto;
import com.priyanshu.clinical.dto.MedicineItemDto;
import com.priyanshu.clinical.dto.PrescriptionResponseDto;
import com.priyanshu.clinical.service.PrescriptionService;
import lombok.Data;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import com.priyanshu.clinical.client.PatientClient;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class AiDoctorChatService {

    private final GroqDirectClient groqClient;
    private final AppointmentAiClient appointmentAiClient;
    private final MedicineClient medicineClient;
    private final PatientClient patientClient;
    private final PrescriptionService prescriptionService;
    private final ObjectMapper objectMapper = new ObjectMapper();

    private static final String DOCTOR_SYSTEM_PROMPT = """
        You are "Priyansh AI Doctor Copilot" — the smart voice/text assistant for Doctors at Priyansh Care Hospital.
        Analyze the doctor's message and output a single JSON object.

        === SYSTEM DATE & CONTEXT ===
        - Current Year is: 2026
        - Current Date is: {currentDate}
        - Logged-in Doctor Name: {doctorName}
        - Logged-in Doctor ID: {doctorId}

        === ACTIONS TO DETECT ===
        1. "GET_SCHEDULE" - When the doctor asks about their appointments, schedule, or who they are meeting today/tomorrow/specific date.
           * Example: "aaj meri koi appointment hai" or "kl kis date ko appointment hai and patient name"
        2. "COMPLETE_APPOINTMENT" - When the doctor wants to complete, confirm, or mark an appointment as done.
           * Example: "appointment 12 complete krdo" or "confirm appointment with Shreya"
        3. "AUTO_PRESCRIPTION" - When the doctor describes a prescription to be generated or says "prescription bnao".
           * Example: "prescription bnao for appointment 12: diagnosis is cold, notes rest, medicine paracetamol x3 for 5 days"
        4. "SEARCH_MEDICINES" - When the doctor asks to check pharmacy inventory or suggest medicines.
           * Example: "suggest medicines for fever" or "cough ki kon si dawai hai stock me"
        5. "GET_PATIENT_DETAILS" - When the doctor asks to view patient details, address, emergency contact, or history for a patient name or ID.
           * Example: "patient Shreya ki detail do" or "patient 2 details"
        6. "NONE" - General chat, greetings.

        === STRICT JSON OUTPUT FORMAT ===
        Reply with a single JSON object. Do not include markdown backticks (```json) or conversational text.
        {
          "action": "GET_SCHEDULE" | "COMPLETE_APPOINTMENT" | "AUTO_PRESCRIPTION" | "SEARCH_MEDICINES" | "GET_PATIENT_DETAILS" | "NONE",
          "date": "yyyy-MM-dd (format date from query, e.g., today is 2026-07-08. Tomorrow is 2026-07-09. If query asks 'kal', output '2026-07-09')",
          "appointmentId": 12,
          "patientId": 3,
          "patientName": "patient's first name if mentioned (e.g. 'Shreya' or 'Priyanshu')",
          "medicineSymptom": "symptom or medicine keyword (e.g. 'fever' or 'cough')",
          "prescription": {
             "appointmentId": 12,
             "diagnosis": "diagnosis name (e.g. 'Fever')",
             "notes": "clinical notes/rest instructions (e.g. 'Rest for 3 days')",
             "medicines": [
                {
                  "name": "generic name of medicine (e.g. 'Paracetamol')",
                  "frequency": "how to take (e.g. '1-0-1' or 'twice daily')",
                  "durationDays": 5,
                  "instructions": "e.g. 'After food'",
                  "quantity": 10
                }
             ]
          },
          "conversationalReply": "friendly assistant mix response if action is NONE"
        }
        """;

    public String chat(String message, Long doctorId, String doctorName) {
        log.info("[Doctor AI] message='{}' from doctorId={}, name={}", message, doctorId, doctorName);
        try {
            String currentDate = LocalDate.now().toString();
            String resolvedPrompt = DOCTOR_SYSTEM_PROMPT
                    .replace("{currentDate}", currentDate)
                    .replace("{doctorName}", doctorName)
                    .replace("{doctorId}", String.valueOf(doctorId));

            // Call Groq directly (bypasses Spring AI's broken deserialization)
            String response = groqClient.call(resolvedPrompt + "\n\nDoctor Message: " + message);
            log.info("[Doctor AI] LLM raw classification: {}", response);

            // Clean LLM response JSON wrapper if present
            int startIndex = response.indexOf("{");
            int endIndex = response.lastIndexOf("}");
            if (startIndex != -1 && endIndex != -1 && startIndex <= endIndex) {
                response = response.substring(startIndex, endIndex + 1);
            } else {
                // If LLM didn't return JSON at all, treat it as a conversational reply
                log.warn("[Doctor AI] LLM did not return JSON. Raw response: {}", response);
                return response;
            }

            DoctorIntent intent = objectMapper.readValue(response, DoctorIntent.class);

            java.util.function.Predicate<String> isInvalid = s -> s == null || s.trim().isEmpty() || "null".equalsIgnoreCase(s) || "none".equalsIgnoreCase(s) || "undefined".equalsIgnoreCase(s);

            String action = intent.getAction() != null ? intent.getAction().toUpperCase() : "NONE";

            switch (action) {
                case "GET_SCHEDULE":
                    return handleGetSchedule(doctorId, intent.getDate(), intent.getPatientName());

                case "COMPLETE_APPOINTMENT":
                    return handleCompleteAppointment(doctorId, intent.getAppointmentId(), intent.getPatientName());

                case "AUTO_PRESCRIPTION":
                    return handleAutoPrescription(doctorId, intent.getPrescription());

                case "SEARCH_MEDICINES":
                    return handleSearchMedicines(intent.getMedicineSymptom());

                case "GET_PATIENT_DETAILS":
                    return handleGetPatientDetails(doctorId, intent.getPatientId(), intent.getPatientName());

                case "NONE":
                default:
                    if (!isInvalid.test(intent.getConversationalReply())) {
                        return intent.getConversationalReply();
                    }
                    return "Namaste Dr. " + doctorName + "! Main aapki schedule check karne, appointments complete karne, auto-prescription likhne, aur patient profiles access karne me help kar sakta hoon.";
            }

        } catch (Exception e) {
            log.error("[Doctor AI] Chat processing error: {} - Cause: {}", e.getClass().getSimpleName(), e.getMessage(), e);
            return "Mujhe aapka request process karne mein kuch takleef ho rahi hai. Kripya dobara try karein.";
        }
    }

    // ─── TOOL IMPLEMENTATIONS ──────────────────────────────────────────────────

    private String handleGetSchedule(Long doctorId, String targetDate, String patientName) {
        try {
            List<AppointmentAiClient.AppointmentConfirmDto> list = appointmentAiClient.getDoctorAppointments(doctorId);
            if (list == null || list.isEmpty()) {
                return "Doctor, data indicates you have no registered appointments in the system.";
            }

            LocalDate filterDate = null;
            if (targetDate != null && !targetDate.trim().isEmpty() && !"null".equalsIgnoreCase(targetDate)) {
                try {
                    filterDate = LocalDate.parse(targetDate.trim());
                } catch (Exception ex) {
                    log.warn("Failed to parse targetDate={}", targetDate);
                }
            }

            final LocalDate finalFilterDate = filterDate;
            List<AppointmentAiClient.AppointmentConfirmDto> filtered = list.stream()
                .filter(a -> {
                    // Filter by date if specified
                    if (finalFilterDate != null) {
                        try {
                            LocalDate apptDate = LocalDateTime.parse(a.getAppointmentTime()).toLocalDate();
                            if (!apptDate.equals(finalFilterDate)) return false;
                        } catch (Exception e) {
                            return false;
                        }
                    }
                    // Filter by patient name if specified
                    if (patientName != null && !patientName.trim().isEmpty() && !"null".equalsIgnoreCase(patientName)) {
                        String nameLower = a.getPatientName() != null ? a.getPatientName().toLowerCase() : "";
                        if (!nameLower.contains(patientName.toLowerCase())) return false;
                    }
                    return true;
                })
                .collect(Collectors.toList());

            if (filtered.isEmpty()) {
                return "Doctor, no appointments match the specified criteria" 
                    + (filterDate != null ? " for " + filterDate : "") 
                    + (patientName != null ? " with patient " + patientName : "") + ".";
            }

            return "Doctor, here is your schedule (" + filtered.size() + " appointments):\n" +
                filtered.stream()
                    .map(a -> {
                        String timeStr = a.getAppointmentTime();
                        try {
                            LocalDateTime ldt = LocalDateTime.parse(a.getAppointmentTime());
                            timeStr = ldt.format(DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm"));
                        } catch (Exception e) {}
                        return "• **Appt #" + a.getId() + "** | Patient: " + a.getPatientName() 
                            + " | Time: " + timeStr + " | Status: " + a.getStatus();
                    })
                    .collect(Collectors.joining("\n"));

        } catch (Exception e) {
            log.error("handleGetSchedule error", e);
            return "Unable to fetch your schedule right now.";
        }
    }

    private String handleCompleteAppointment(Long doctorId, Long appointmentId, String patientName) {
        try {
            Long targetApptId = appointmentId;

            // If ID not provided but patient name is, search in scheduled appointments
            if (targetApptId == null && patientName != null && !patientName.trim().isEmpty() && !"null".equalsIgnoreCase(patientName)) {
                List<AppointmentAiClient.AppointmentConfirmDto> list = appointmentAiClient.getDoctorAppointments(doctorId);
                AppointmentAiClient.AppointmentConfirmDto found = list.stream()
                    .filter(a -> "BOOKED".equalsIgnoreCase(a.getStatus()) || "CONFIRMED".equalsIgnoreCase(a.getStatus()))
                    .filter(a -> a.getPatientName() != null && a.getPatientName().toLowerCase().contains(patientName.toLowerCase()))
                    .findFirst()
                    .orElse(null);

                if (found != null) {
                    targetApptId = found.getId();
                }
            }

            if (targetApptId == null) {
                return "Doctor, please specify the Appointment ID or the Patient Name to mark as completed (e.g. 'Complete appointment with Shreya').";
            }

            AppointmentAiClient.AppointmentConfirmDto updated = appointmentAiClient.completeAppointment(targetApptId);
            return "✅ Appointment #" + updated.getId() + " for Patient " + updated.getPatientName() + " has been successfully marked as **COMPLETED**.";

        } catch (Exception e) {
            log.error("handleCompleteAppointment error", e);
            return "Error while completing appointment in database. Please verify the ID.";
        }
    }

    private String handleAutoPrescription(Long doctorId, PrescriptionInput input) {
        try {
            if (input == null || input.getAppointmentId() == null) {
                return "Doctor, kripya prescription likhne ke liye **Appointment ID** zaroor specify karein (e.g. 'prescription bnao appointment 12 ke liye').";
            }

            Long apptId = input.getAppointmentId();

            CreatePrescriptionRequestDto dto = new CreatePrescriptionRequestDto();
            dto.setDiagnosis(input.getDiagnosis() != null ? input.getDiagnosis() : "Routine consultation");
            dto.setNotes(input.getNotes() != null ? input.getNotes() : "Rest and hydration");

            List<MedicineItemDto> medItems = new ArrayList<>();
            
            // Search medicines in pharmacy inventory to map names to IDs
            List<MedicineClient.MedicineResponseDto> allMeds = medicineClient.getAllMedicines();

            if (input.getMedicines() != null) {
                for (PrescriptionInput.MedInput m : input.getMedicines()) {
                    // Try to match name
                    MedicineClient.MedicineResponseDto match = allMeds.stream()
                        .filter(item -> item.getName() != null && item.getName().toLowerCase().contains(m.getName().toLowerCase()))
                        .findFirst()
                        .orElse(null);

                    if (match == null) {
                        return "Medicine '" + m.getName() + "' could not be found in pharmacy inventory. Auto-prescription aborted.";
                    }

                    MedicineItemDto item = new MedicineItemDto();
                    item.setMedicineId(match.getId());
                    item.setFrequency(m.getFrequency() != null ? m.getFrequency() : "1-0-1");
                    item.setDurationDays(m.getDurationDays() != null ? m.getDurationDays() : 5);
                    item.setInstructions(m.getInstructions() != null ? m.getInstructions() : "After meals");
                    item.setQuantity(m.getQuantity() != null ? m.getQuantity() : 10);
                    medItems.add(item);
                }
            }

            dto.setMedicines(medItems);

            // Save prescription
            PrescriptionResponseDto saved = prescriptionService.createPrescription(apptId, dto);
            return "✅ **Prescription Saved Successfully!**\n" +
                "• **Appointment ID:** #" + apptId + "\n" +
                "• **Diagnosis:** " + saved.getDiagnosis() + "\n" +
                "• **Clinical Notes:** " + saved.getNotes() + "\n" +
                "• **Medicines Added:** " + (saved.getMedicines() != null ? saved.getMedicines().size() : 0) + " items.";

        } catch (Exception e) {
            log.error("handleAutoPrescription error", e);
            return "Failed to save prescription automatically. Ensure the Appointment exists and has not already been completed.";
        }
    }

    private String handleSearchMedicines(String keyword) {
        try {
            if (keyword == null || keyword.trim().isEmpty() || "null".equalsIgnoreCase(keyword)) {
                return "Please specify a symptom or drug name to check inventory.";
            }

            List<MedicineClient.MedicineResponseDto> all = medicineClient.getAllMedicines();
            List<MedicineClient.MedicineResponseDto> matches = all.stream()
                .filter(m -> (m.getName() != null && m.getName().toLowerCase().contains(keyword.toLowerCase()))
                    || (m.getCategory() != null && m.getCategory().toLowerCase().contains(keyword.toLowerCase())))
                .collect(Collectors.toList());

            if (matches.isEmpty()) {
                return "No medicines in stock match '" + keyword + "'.";
            }

            return "💊 **Pharmacy Inventory Match for '" + keyword + "':**\n" +
                matches.stream()
                    .map(m -> "• " + m.getName() + " (" + m.getCategory() + ") | Stock: " + m.getStock() + " | Price: Rs." + m.getPrice())
                    .collect(Collectors.joining("\n"));

        } catch (Exception e) {
            log.error("handleSearchMedicines error", e);
            return "Failed to fetch pharmacy inventory status.";
        }
    }

    private String handleGetPatientDetails(Long doctorId, Long patientId, String patientName) {
        try {
            Long targetPatientId = patientId;

            // Resolve patientId from doctor's appointment list if name is given instead of ID
            if (targetPatientId == null && patientName != null && !patientName.trim().isEmpty() && !"null".equalsIgnoreCase(patientName)) {
                List<AppointmentAiClient.AppointmentConfirmDto> list = appointmentAiClient.getDoctorAppointments(doctorId);
                AppointmentAiClient.AppointmentConfirmDto found = list.stream()
                    .filter(a -> a.getPatientName() != null && a.getPatientName().toLowerCase().contains(patientName.toLowerCase()))
                    .findFirst()
                    .orElse(null);

                if (found != null) {
                    targetPatientId = found.getPatientId();
                }
            }

            if (targetPatientId == null) {
                return "Doctor, please specify the Patient ID or Patient Name to fetch records (e.g., 'Shreya ki detail do').";
            }

            PatientClient.PatientFullDto profile = patientClient.getPatientById(targetPatientId);
            
            // Format blood group
            String bgSymbol = "N/A";
            if (profile.getBloodGroup() != null) {
                bgSymbol = profile.getBloodGroup().replace("_POSITIVE","+").replace("_NEGATIVE","-");
            }

            return "🧑‍⚕️ **Patient Profile File Card (ID: #" + profile.getId() + ")**\n" +
                "• **Name:** " + profile.getName() + "\n" +
                "• **Father's Name:** " + (profile.getFatherName() != null ? profile.getFatherName() : "N/A") + "\n" +
                "• **Gender / DOB:** " + profile.getGender() + " | " + profile.getBirthDate() + "\n" +
                "• **Blood Group:** " + bgSymbol + "\n" +
                "• **Contact:** " + profile.getPhone() + " | " + profile.getEmail() + "\n" +
                "• **Residential Address:** " + profile.getAddress() + ", " + profile.getCity() + ", " + profile.getState() + " - " + profile.getPincode() + "\n" +
                "• **Emergency Contact:** " + profile.getEmergencyContactName() + " (" + profile.getEmergencyContactPhone() + ")\n" +
                "• **Vitals:** " + (profile.getHeight() != null ? profile.getHeight() + "cm" : "N/A") + " / " 
                                + (profile.getWeight() != null ? profile.getWeight() + "kg" : "N/A");

        } catch (Exception e) {
            log.error("handleGetPatientDetails error", e);
            return "Unable to retrieve patient details from patient-service. Please verify if the ID or name is correct.";
        }
    }

    // ─── DTO CLASSIFICATION SCHEMAS ───────────────────────────────────────────

    @Data
    @JsonIgnoreProperties(ignoreUnknown = true)
    public static class DoctorIntent {
        private String action;
        private String date;
        private Long appointmentId;
        private Long patientId;
        private String patientName;
        private String medicineSymptom;
        private PrescriptionInput prescription;
        private String conversationalReply;
    }

    @Data
    @JsonIgnoreProperties(ignoreUnknown = true)
    public static class PrescriptionInput {
        private Long appointmentId;
        private String diagnosis;
        private String notes;
        private List<MedInput> medicines;

        @Data
        @JsonIgnoreProperties(ignoreUnknown = true)
        public static class MedInput {
            private String name;
            private String frequency;
            private Integer durationDays;
            private String instructions;
            private Integer quantity;
        }
    }
}
