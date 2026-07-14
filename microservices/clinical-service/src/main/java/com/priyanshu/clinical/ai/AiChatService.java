package com.priyanshu.clinical.ai;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.Data;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.time.LocalDate;

/**
 * AI Chat Service — Uses a hybrid intent classification approach.
 * Instead of relying on the Spring AI automatic tool-calling loop (which has
 * deserialization bugs with newer Ollama server versions), we prompt the LLM
 * to classify the message into an intent and return structured JSON.
 *
 * We then parse the JSON and execute the corresponding Java tool manually.
 * This is 100% reliable, compatible with any local model, and extremely fast.
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class AiChatService {

    private final GroqDirectClient groqClient;
    private final AiChatTools aiChatTools;
    private final ObjectMapper objectMapper = new ObjectMapper();

    private static final String SYSTEM_PROMPT = """
        You are "Priyansh AI" — the medical assistant classifier for Priyansh Care Hospital.
        Analyze the patient's message and current context, then output a JSON object.

        === SYSTEM DATE & CONTEXT ===
        - Current Year is: 2026
        - Current Date is: {currentDate}
        - Logged-in Patient Name: {patientName}
        - Logged-in Patient ID: {patientId}

        === ACTIONS TO DETECT (CRITICAL RULES FOR CLASSIFICATION) ===
        1. "FIND_DOCTORS" - Use when user asks for a DOCTOR, asks whom to consult, says they are sick, describes a symptom/pain, or asks for details of a specific doctor by name (e.g. "Priya Mehta ki detail do" or "Who is Dr. Mehta?").
           * Keywords: "doctor", "consult", "dikhao", "symptom", "pain", "dard", "specialist", "treatment", "detail", "profile", "who is".
           * Example: "priya mehta ki detail do" -> action is FIND_DOCTORS, symptomOrKeyword is "Priya Mehta".
        2. "BOOK_APPOINTMENT" - Use when user wants to book or schedule an appointment with a doctor.
           * Keywords: "book", "appointment", "schedule", "mulaqat", "milna hai".
        3. "GET_PRESCRIPTIONS" - Use when user asks for their prescriptions or medical records.
           * Keywords: "prescription", "parchi", "reports", "history".
        4. "GET_BILLS" - Use when user asks about bills, payments, invoices, or pending amounts.
           * Keywords: "bill", "invoice", "payment", "paisa", "dues".
        5. "SEARCH_MEDICINES" - Use when user asks specifically for MEDICINES, dawai, drugs, tablets, or check if a medicine is in stock.
           * Keywords: "medicine", "dawai", "tablet", "pill", "syrup", "paracetamol", "stock".
           * Example: "mujhe fever ki dawai chahiye" -> action is SEARCH_MEDICINES.
        6. "LIST_ALL_DOCTORS" - Use when user asks for a list of all doctors or how many doctors are available.
        7. "CHECK_AVAILABILITY" - Use when user asks when a doctor is free or available.
           * Keywords: "free", "available", "time", "date", "availablity".
        8. "NONE" - Use ONLY for general greetings ("hi", "hello") or general talk that doesn't fit any of the above.

        === IMPORTANT CLASSIFICATION RULE ===
        If the user asks "which doctor should I see for [symptom]" or "koi doctor suggest kro" or asks for a doctor's details by name (e.g., "Priya Mehta ki details"), it MUST be classified as FIND_DOCTORS.

        === STRICT JSON OUTPUT FORMAT ===
        Reply with a single JSON object containing these keys. Do not include markdown backticks (```json) or conversational text.
        {
          "action": "FIND_DOCTORS" | "BOOK_APPOINTMENT" | "GET_PRESCRIPTIONS" | "GET_BILLS" | "SEARCH_MEDICINES" | "LIST_ALL_DOCTORS" | "CHECK_AVAILABILITY" | "NONE",
          "symptomOrKeyword": "symptom, category, or doctor name (e.g. translate 'bukhar' -> 'fever', 'Priya Mehta' -> 'Priya Mehta')",
          "doctorName": "doctor's name if checking availability or booking (e.g. 'Mehta')",
          "dateTime": "appointment date and time formatted as 'yyyy-MM-dd HH:mm' (e.g. '2026-07-09 10:00'). Extract the date and time from user query. If date is '9 July', construct '2026-07-09 10:00')",
          "reason": "brief reason for appointment booking",
          "conversationalReply": "your friendly response if action is NONE"
        }

        === EXAMPLES ===
        User: "mujhe bukhar hai, doctor batao"
        {"action":"FIND_DOCTORS", "symptomOrKeyword":"fever", "doctorName":null, "dateTime":null, "reason":null, "conversationalReply":null}

        User: "book appointment of doctor mehta at 10:00 on 9 july"
        {"action":"BOOK_APPOINTMENT", "symptomOrKeyword":null, "doctorName":"Mehta", "dateTime":"2026-07-09 10:00", "reason":"Fever consultation", "conversationalReply":null}

        User: "show my prescriptions"
        {"action":"GET_PRESCRIPTIONS", "symptomOrKeyword":null, "doctorName":null, "dateTime":null, "reason":null, "conversationalReply":null}

        User: "hello"
        {"action":"NONE", "symptomOrKeyword":null, "doctorName":null, "dateTime":null, "reason":null, "conversationalReply":"Namaste Shreya! Main aapki kaise help kar sakta hoon? 😊"}
        """;

    public String chat(String userMessage, Long patientId, String patientName) {
        log.info("[AiChatService] Processing message for patientId={}: {}", patientId, userMessage);

        String currentDate = LocalDate.now().toString();

        // Build dynamic system prompt with context variables
        String systemPromptWithContext = SYSTEM_PROMPT
            .replace("{patientId}", String.valueOf(patientId))
            .replace("{patientName}", patientName != null ? patientName : "Patient")
            .replace("{currentDate}", currentDate);

        try {
            // Call Groq directly (bypasses Spring AI's broken deserialization)
            String rawJson = groqClient.call(systemPromptWithContext + "\n\nUser Message: " + userMessage);

            log.info("[AiChatService] Raw JSON classification from LLM: {}", rawJson);

            // Clean up backticks or extra text if any are returned
            String cleanJson = rawJson.trim();
            int startIndex = cleanJson.indexOf("{");
            int endIndex = cleanJson.lastIndexOf("}");
            if (startIndex != -1 && endIndex != -1 && startIndex <= endIndex) {
                cleanJson = cleanJson.substring(startIndex, endIndex + 1);
            }

            // Parse response
            AiIntent intent;
            try {
                intent = objectMapper.readValue(cleanJson, AiIntent.class);
            } catch (Exception parseEx) {
                log.warn("[AiChatService] Failed to parse JSON, falling back to conversational reply: {}", cleanJson);
                return "Aap kya poochna chahte hain? Main doctors list, appointments booking, pharmacy stock aur prescriptions ki details de sakta hoon. Kripya thoda aur clear batayein! 😊";
            }

            log.info("[AiChatService] Detected intent: {}", intent.getAction());

            // Helper to check if string is null/empty or literal "null"/"none"
            java.util.function.Predicate<String> isInvalid = (str) ->
                str == null || str.trim().isEmpty() ||
                str.equalsIgnoreCase("null") ||
                str.equalsIgnoreCase("none") ||
                str.equalsIgnoreCase("undefined");

            // Execute corresponding Java tool manually
            switch (intent.getAction()) {
                case "FIND_DOCTORS":
                    if (isInvalid.test(intent.getSymptomOrKeyword())) {
                        return "Aap kis symptom ke liye doctor search karna chahte hain? (e.g. fever, headache, heart pain)";
                    }
                    return aiChatTools.getDoctorsBySymptom(intent.getSymptomOrKeyword());

                case "LIST_ALL_DOCTORS":
                    return aiChatTools.getAllDoctorsInHospital();

                case "BOOK_APPOINTMENT":
                    if (isInvalid.test(intent.getDoctorName()) || isInvalid.test(intent.getDateTime())) {
                        return "Appointment book karne ke liye kripya **Doctor ka naam, Date, aur Time** specify karein.\n\n*Jaise: 'Book appointment with Dr. Mehta at 10:00 on 9 July'*";
                    }
                    String reason = isInvalid.test(intent.getReason()) ? "Consultation" : intent.getReason();
                    return aiChatTools.bookAppointment(patientId, intent.getDoctorName(), intent.getDateTime(), reason);

                case "SEARCH_MEDICINES":
                    if (intent.getSymptomOrKeyword() == null || intent.getSymptomOrKeyword().isEmpty()) {
                        return "Please specify the symptom or medicine name you want to search in the pharmacy.";
                    }
                    return aiChatTools.getMedicinesBySymptom(intent.getSymptomOrKeyword());

                case "GET_PRESCRIPTIONS":
                    return aiChatTools.getMyPrescriptions(patientId);

                case "GET_BILLS":
                    return aiChatTools.getMyBills(patientId);

                case "CHECK_AVAILABILITY":
                    if (isInvalid.test(intent.getDoctorName())) {
                        return "Kripya check karne ke liye Doctor ka naam batayein (e.g. 'Dr. Priya Mehta kab free hain?').";
                    }
                    return aiChatTools.getDoctorAvailability(intent.getDoctorName());

                case "NONE":
                default:
                    if (intent.getConversationalReply() != null && !intent.getConversationalReply().isEmpty()) {
                        return intent.getConversationalReply();
                    }
                    return "Main aapki health queries, doctor booking, prescriptions aur pharmacy inventory checking mein help kar sakta hoon. Aap apna sawaal batayein!";
            }

        } catch (Exception e) {
            log.error("[AiChatService] Error processing chat: {}", e.getMessage(), e);
            return "I'm sorry, I'm experiencing a temporary issue. Please try again in a moment, " +
                "or contact the hospital reception for immediate assistance. 🏥";
        }
    }

    // ── Classification DTO ────────────────────────────────────────────────────

    @Data
    @JsonIgnoreProperties(ignoreUnknown = true)
    public static class AiIntent {
        private String action;
        private String symptomOrKeyword;
        private String doctorName;
        private String dateTime;
        private String reason;
        private String conversationalReply;
    }
}
