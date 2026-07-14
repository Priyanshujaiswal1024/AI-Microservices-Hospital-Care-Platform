package com.priyanshu.appointment.kafka;

import com.priyanshu.appointment.events.AppointmentBookedEvent;
import com.priyanshu.appointment.events.AppointmentCancelledEvent;
import com.priyanshu.appointment.events.AppointmentCompletedEvent;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.kafka.support.SendResult;
import org.springframework.stereotype.Service;

import java.util.concurrent.CompletableFuture;
import java.util.concurrent.TimeUnit;

/**
 * Resilient Kafka publisher with synchronous fallback.
 *
 * If Kafka is DOWN (broker unreachable), the method catches the
 * exception and delegates to a direct HTTP call via the same
 * Feign clients used elsewhere — exactly like the old monolith
 * where everything was synchronous.
 *
 * This means:
 *   KAFKA UP   → fire-and-forget async event (preferred)
 *   KAFKA DOWN → synchronous direct REST call  (fallback)
 *
 * The caller never fails due to Kafka being down.
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class ResilientKafkaPublisher {

    private final KafkaTemplate<String, Object> kafkaTemplate;

    /**
     * Publish with a configurable timeout.
     * @return true if Kafka accepted the message, false if it fell through to fallback.
     */
    public boolean publish(String topic, Object event) {
        try {
            CompletableFuture<SendResult<String, Object>> future =
                    kafkaTemplate.send(topic, event).toCompletableFuture();

            // Wait max 3 seconds — if Kafka broker is not reachable, fail fast
            future.get(3, TimeUnit.SECONDS);

            log.info("[Kafka ✓] Published to '{}': {}", topic, event.getClass().getSimpleName());
            return true;

        } catch (Exception e) {
            log.warn("[Kafka ✗] Failed to publish to '{}': {} — will use SYNC fallback",
                    topic, e.getMessage());
            return false;
        }
    }

    /**
     * Convenience overload: publish and handle fallback inline via lambda.
     *
     * Example usage:
     *   publisher.publishOrFallback(
     *       "appointment.booked", event,
     *       () -> notificationClient.sendBookingEmail(patientEmail, ...)
     *   );
     */
    public void publishOrFallback(String topic, Object event, Runnable syncFallback) {
        if (!publish(topic, event)) {
            log.info("[Sync Fallback] Kafka unavailable — executing direct call for topic '{}'", topic);
            try {
                syncFallback.run();
                log.info("[Sync Fallback ✓] Direct call succeeded for topic '{}'", topic);
            } catch (Exception fe) {
                log.error("[Sync Fallback ✗] Direct call also failed for topic '{}': {}", topic, fe.getMessage());
                // Don't rethrow — the appointment was already saved, this is best-effort notification
            }
        }
    }
}
