package com.priyanshu.clinical.ai;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.Data;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.*;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestTemplate;

import java.util.List;
import java.util.Map;

/**
 * Direct HTTP client to Groq API — bypasses Spring AI's broken deserialization
 * with Groq's response format (which includes extra fields like "x_groq").
 */
@Slf4j
@Component
public class GroqDirectClient {

    private final RestTemplate restTemplate = new RestTemplate();
    private final ObjectMapper objectMapper = new ObjectMapper();

    @Value("${spring.ai.openai.api-key}")
    private String apiKey;

    @Value("${spring.ai.openai.chat.options.model:llama-3.1-8b-instant}")
    private String model;

    private static final String GROQ_URL = "https://api.groq.com/openai/v1/chat/completions";

    /**
     * Call Groq with a single user message (system prompt + user content merged).
     */
    public String call(String prompt) {
        try {
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);
            headers.setBearerAuth(apiKey);

            Map<String, Object> body = Map.of(
                "model", model,
                "temperature", 0.3,
                "max_tokens", 1024,
                "messages", List.of(
                    Map.of("role", "user", "content", prompt)
                )
            );

            String jsonBody = objectMapper.writeValueAsString(body);
            HttpEntity<String> entity = new HttpEntity<>(jsonBody, headers);

            ResponseEntity<GroqResponse> response = restTemplate.exchange(
                GROQ_URL, HttpMethod.POST, entity, GroqResponse.class
            );

            if (response.getBody() != null
                    && response.getBody().getChoices() != null
                    && !response.getBody().getChoices().isEmpty()) {
                String content = response.getBody().getChoices().get(0).getMessage().getContent();
                log.debug("[GroqDirectClient] Response: {}", content);
                return content;
            }
            return "";
        } catch (Exception e) {
            log.error("[GroqDirectClient] Error calling Groq: {}", e.getMessage(), e);
            throw new RuntimeException("Groq API call failed: " + e.getMessage(), e);
        }
    }

    // ── Response DTOs ─────────────────────────────────────────────────────────

    @Data
    @JsonIgnoreProperties(ignoreUnknown = true)
    public static class GroqResponse {
        private String id;
        private List<Choice> choices;
    }

    @Data
    @JsonIgnoreProperties(ignoreUnknown = true)
    public static class Choice {
        private Message message;
    }

    @Data
    @JsonIgnoreProperties(ignoreUnknown = true)
    public static class Message {
        private String role;
        private String content;
    }
}
