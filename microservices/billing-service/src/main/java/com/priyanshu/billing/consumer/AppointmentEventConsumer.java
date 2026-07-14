package com.priyanshu.billing.consumer;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.priyanshu.billing.events.AppointmentCompletedEvent;
import com.priyanshu.billing.service.BillService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.kafka.annotation.KafkaListener;
import org.springframework.stereotype.Component;

/**
 * Listens for appointment.completed events.
 * When an appointment is completed, auto-generates a bill.
 */
@Slf4j
@Component
@RequiredArgsConstructor
public class AppointmentEventConsumer {

    private final BillService billService;
    private final ObjectMapper objectMapper;

    @KafkaListener(topics = "appointment.completed", groupId = "billing-group",
            containerFactory = "kafkaListenerContainerFactory")
    public void onAppointmentCompleted(String message) {
        try {
            AppointmentCompletedEvent event = objectMapper.readValue(message, AppointmentCompletedEvent.class);
            log.info("[Kafka] appointment.completed received: appointmentId={}", event.getAppointmentId());
            billService.generateBillFromEvent(event);
        } catch (Exception e) {
            log.error("[Kafka] Failed to process appointment.completed: {}", e.getMessage());
        }
    }
}
