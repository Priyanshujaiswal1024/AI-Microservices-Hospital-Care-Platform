package com.priyanshu.appointment.client;

import com.priyanshu.appointment.dto.notification.EmailBookingRequest;
import com.priyanshu.appointment.dto.notification.EmailCancelRequest;
import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;

/**
 * SYNC FALLBACK Feign client → notification-service REST endpoint.
 *
 * Used ONLY when Kafka is DOWN.
 * The notification-service exposes /internal/email/** endpoints
 * that bypass Kafka and call EmailService directly.
 *
 * This replicates the old monolith's synchronous EmailService calls.
 */
@FeignClient(name = "notification-service", url = "${notification.service.url}")
public interface NotificationFallbackClient {

    /** Called when appointment.booked Kafka event cannot be sent */
    @PostMapping("/internal/email/appointment-booked")
    void sendBookingConfirmation(@RequestBody EmailBookingRequest request);

    /** Called when appointment.cancelled Kafka event cannot be sent */
    @PostMapping("/internal/email/appointment-cancelled")
    void sendCancellationEmail(@RequestBody EmailCancelRequest request);
}
