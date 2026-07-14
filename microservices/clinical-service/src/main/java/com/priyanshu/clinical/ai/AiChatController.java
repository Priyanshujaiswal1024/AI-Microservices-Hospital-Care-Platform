package com.priyanshu.clinical.ai;

import lombok.Data;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

/**
 * REST endpoint for the AI Patient Assistant chatbot.
 * Exposed at POST /api/v1/prescriptions/ai-chat
 * (Routed via existing API Gateway prescription route — no gateway change needed)
 *
 * The patient's userId is injected by the GatewayHeaderAuthFilter as a request attribute.
 */
@Slf4j
@RestController
@RequestMapping("/api/v1/prescriptions")
@RequiredArgsConstructor
public class AiChatController {

    private final AiChatService aiChatService;
    private final AiDoctorChatService aiDoctorChatService;

    // Rate Limiter: Max 5 requests per 1 minute (60,000 ms) per user
    private final RateLimiter chatRateLimiter = new RateLimiter(5, 60000);

    @PostMapping("/ai-chat")
    public ResponseEntity<AiChatResponse> chat(
            @RequestBody AiChatRequest request,
            @RequestAttribute(name = "userId", required = false) Long userId,
            @RequestAttribute(name = "userName", required = false) String userName) {

        // Use userId from request if attribute missing (e.g. during local testing)
        Long effectivePatientId = (userId != null) ? userId
                : (request.getPatientId() != null ? request.getPatientId() : 0L);
        String effectiveName = (userName != null) ? userName
                : (request.getPatientName() != null ? request.getPatientName() : "Patient");

        log.info("[AiChatController] Chat request: patientId={}, message={}",
            effectivePatientId, request.getMessage());

        // Apply Rate Limiting
        String rateLimitKey = "patient_" + effectivePatientId;
        if (!chatRateLimiter.tryAcquire(rateLimitKey)) {
            return ResponseEntity.ok(new AiChatResponse("Too many requests! Kripya 1 minute baad try karein. (Rate limit: 5 requests per minute)"));
        }

        String aiReply = aiChatService.chat(request.getMessage(), effectivePatientId, effectiveName);
        return ResponseEntity.ok(new AiChatResponse(aiReply));
    }

    @PostMapping("/ai-chat-doctor")
    public ResponseEntity<AiChatResponse> chatDoctor(
            @RequestBody AiChatRequest request,
            @RequestAttribute(name = "userId", required = false) Long userId,
            @RequestAttribute(name = "userName", required = false) String userName) {

        Long effectiveDoctorId = (userId != null) ? userId
                : (request.getPatientId() != null ? request.getPatientId() : 0L);
        String effectiveName = (userName != null) ? userName
                : (request.getPatientName() != null ? request.getPatientName() : "Doctor");

        log.info("[AiChatController] Doctor Chat request: doctorId={}, message={}",
            effectiveDoctorId, request.getMessage());

        // Apply Rate Limiting
        String rateLimitKey = "doctor_" + effectiveDoctorId;
        if (!chatRateLimiter.tryAcquire(rateLimitKey)) {
            return ResponseEntity.ok(new AiChatResponse("Too many requests! Kripya 1 minute baad try karein. (Rate limit: 5 requests per minute)"));
        }

        String aiReply = aiDoctorChatService.chat(request.getMessage(), effectiveDoctorId, effectiveName);
        return ResponseEntity.ok(new AiChatResponse(aiReply));
    }

    // ── DTOs ──────────────────────────────────────────────────────────────────

    @Data
    public static class AiChatRequest {
        private String message;
        private Long patientId;       // fallback if header not set
        private String patientName;   // fallback if header not set
    }

    @Data
    public static class AiChatResponse {
        private final String reply;
        private final long timestamp = System.currentTimeMillis();
    }
}
