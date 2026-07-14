package com.priyanshu.notification.service;

import io.github.resilience4j.circuitbreaker.annotation.CircuitBreaker;
import io.github.resilience4j.retry.annotation.Retry;
import jakarta.mail.MessagingException;
import jakarta.mail.internet.MimeMessage;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;
import org.thymeleaf.TemplateEngine;
import org.thymeleaf.context.Context;
import com.priyanshu.notification.util.RateLimiter;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.List;

/**
 * ══════════════════════════════════════════════════════════════════════
 * EmailService — Resilient Email Sender
 * ══════════════════════════════════════════════════════════════════════
 *
 * RESILIENCE STRATEGY:
 *   1. @Async   — email is fire-and-forget (never blocks the caller)
 *   2. @Retry   — retries 3 times with exponential backoff if SMTP fails
 *   3. @CircuitBreaker — if email keeps failing (SMTP server down),
 *                        the circuit OPENS and subsequent calls immediately
 *                        return (with a silent log), so no service is
 *                        blocked by a dead email server.
 *
 * This means:
 *   - ALL other microservices continue working even if Gmail SMTP is down.
 *   - Appointments are booked, bills are generated, prescriptions are saved.
 *   - Only the email notification is skipped (with a warning log).
 *   - Circuit auto-resets after 30 seconds (half-open probe attempt).
 * ══════════════════════════════════════════════════════════════════════
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class EmailService {

    private final JavaMailSender mailSender;
    private final TemplateEngine templateEngine;

    // Rate Limiter: Max 5 emails per 1 minute (60,000 ms) per recipient email
    private final RateLimiter emailLimiter = new RateLimiter(5, 60000);

    private static final DateTimeFormatter DATE_FMT =
            DateTimeFormatter.ofPattern("dd MMM yyyy, hh:mm a");

    // ── 1. OTP EMAIL ─────────────────────────────────────────────────────────
    @Async
    @Retry(name = "emailRetry")
    @CircuitBreaker(name = "emailCircuitBreaker", fallbackMethod = "emailFallback")
    public void sendOtp(String toEmail, String otp) {
        Context ctx = new Context();
        ctx.setVariable("otp", otp);
        send(toEmail, "Verify Your Email — City Care Hospital", "otp-email", ctx);
    }

    // ── 2. APPOINTMENT BOOKED ─────────────────────────────────────────────────
    @Async
    @Retry(name = "emailRetry")
    @CircuitBreaker(name = "emailCircuitBreaker", fallbackMethod = "emailFallbackWith5Args")
    public void sendAppointmentBooked(String toEmail, String patientName,
                                      String doctorName, LocalDateTime appointmentTime,
                                      String reason) {
        Context ctx = new Context();
        ctx.setVariable("patientName", patientName);
        ctx.setVariable("doctorName", doctorName);
        ctx.setVariable("appointmentTime", appointmentTime.format(DATE_FMT));
        ctx.setVariable("reason", reason);
        send(toEmail, "Appointment Confirmed — City Care Hospital", "appointment-booked", ctx);
    }

    // ── 3. APPOINTMENT CANCELLED ──────────────────────────────────────────────
    @Async
    @Retry(name = "emailRetry")
    @CircuitBreaker(name = "emailCircuitBreaker", fallbackMethod = "emailFallbackWith3Args")
    public void sendAppointmentCancelled(String toEmail, String patientName,
                                         LocalDateTime appointmentTime) {
        Context ctx = new Context();
        ctx.setVariable("patientName", patientName);
        ctx.setVariable("appointmentTime", appointmentTime.format(DATE_FMT));
        send(toEmail, "Appointment Cancelled — City Care Hospital", "appointment-cancelled", ctx);
    }

    // ── 4. BILL GENERATED ─────────────────────────────────────────────────────
    @Async
    @Retry(name = "emailRetry")
    @CircuitBreaker(name = "emailCircuitBreaker", fallbackMethod = "emailFallbackBill")
    public void sendBillGenerated(String toEmail, String patientName,
                                  Double consultationFee, Double gstAmount,
                                  Double totalAmount, Long billId) {
        Context ctx = new Context();
        ctx.setVariable("patientName", patientName);
        ctx.setVariable("consultationFee", String.format("%.2f", consultationFee));
        ctx.setVariable("gstAmount", String.format("%.2f", gstAmount));
        ctx.setVariable("totalAmount", String.format("%.2f", totalAmount));
        ctx.setVariable("billId", String.format("INV-%05d", billId));
        send(toEmail, "Invoice Generated — City Care Hospital", "bill-generated", ctx);
    }

    // ── 5. PAYMENT CONFIRMED ──────────────────────────────────────────────────
    @Async
    @Retry(name = "emailRetry")
    @CircuitBreaker(name = "emailCircuitBreaker", fallbackMethod = "emailFallbackPayment")
    public void sendPaymentConfirmation(String toEmail, String patientName,
                                        Double totalAmount, Long billId,
                                        LocalDateTime paidAt) {
        Context ctx = new Context();
        ctx.setVariable("patientName", patientName);
        ctx.setVariable("totalAmount", String.format("%.2f", totalAmount));
        ctx.setVariable("billId", String.format("INV-%05d", billId));
        ctx.setVariable("paidAt", paidAt.format(DATE_FMT));
        send(toEmail, "Payment Received — City Care Hospital", "payment-confirmed", ctx);
    }

    // ── 6. PRESCRIPTION ADDED ─────────────────────────────────────────────────
    @Async
    @Retry(name = "emailRetry")
    @CircuitBreaker(name = "emailCircuitBreaker", fallbackMethod = "emailFallbackPrescription")
    public void sendPrescriptionAdded(String toEmail, String patientName,
                                      String doctorName, String diagnosis,
                                      List<?> medicines) {
        Context ctx = new Context();
        ctx.setVariable("patientName", patientName);
        ctx.setVariable("doctorName", doctorName);
        ctx.setVariable("diagnosis", diagnosis);
        ctx.setVariable("medicines", medicines);
        send(toEmail, "Your Prescription — City Care Hospital", "prescription-added", ctx);
    }

    // ── 7. DOCTOR WELCOME ─────────────────────────────────────────────────────
    @Async
    @Retry(name = "emailRetry")
    @CircuitBreaker(name = "emailCircuitBreaker", fallbackMethod = "emailFallbackWith3StringArgs")
    public void sendDoctorWelcome(String toEmail, String doctorName, String tempPassword) {
        Context ctx = new Context();
        ctx.setVariable("doctorName", doctorName);
        ctx.setVariable("email", toEmail);
        ctx.setVariable("tempPassword", tempPassword);
        send(toEmail, "Welcome to City Care Hospital — Your Account Details", "welcome", ctx);
    }

    // ══════════════════════════════════════════════════════════════════════════
    // CIRCUIT BREAKER FALLBACKS
    // These methods are called when the circuit is OPEN (email server is down).
    // They silently log and return — NO EXCEPTION is thrown to callers.
    // Appointment booking, billing, etc. all continue working normally.
    // ══════════════════════════════════════════════════════════════════════════

    public void emailFallback(String toEmail, String otp, Throwable t) {
        log.warn("[Circuit Breaker OPEN] OTP email to {} skipped — SMTP unavailable: {}", toEmail, t.getMessage());
    }

    public void emailFallbackWith5Args(String toEmail, String patientName,
                                       String doctorName, LocalDateTime appointmentTime,
                                       String reason, Throwable t) {
        log.warn("[Circuit Breaker OPEN] Appointment booked email to {} skipped — SMTP unavailable: {}", toEmail, t.getMessage());
    }

    public void emailFallbackWith3Args(String toEmail, String patientName,
                                       LocalDateTime appointmentTime, Throwable t) {
        log.warn("[Circuit Breaker OPEN] Appointment cancelled email to {} skipped — SMTP unavailable: {}", toEmail, t.getMessage());
    }

    public void emailFallbackBill(String toEmail, String patientName,
                                  Double consultationFee, Double gstAmount,
                                  Double totalAmount, Long billId, Throwable t) {
        log.warn("[Circuit Breaker OPEN] Bill generated email to {} skipped — SMTP unavailable: {}", toEmail, t.getMessage());
    }

    public void emailFallbackPayment(String toEmail, String patientName,
                                     Double totalAmount, Long billId,
                                     LocalDateTime paidAt, Throwable t) {
        log.warn("[Circuit Breaker OPEN] Payment confirmation email to {} skipped — SMTP unavailable: {}", toEmail, t.getMessage());
    }

    public void emailFallbackPrescription(String toEmail, String patientName,
                                          String doctorName, String diagnosis,
                                          List<?> medicines, Throwable t) {
        log.warn("[Circuit Breaker OPEN] Prescription email to {} skipped — SMTP unavailable: {}", toEmail, t.getMessage());
    }

    public void emailFallbackWith3StringArgs(String toEmail, String doctorName,
                                             String tempPassword, Throwable t) {
        log.warn("[Circuit Breaker OPEN] Doctor welcome email to {} skipped — SMTP unavailable: {}", toEmail, t.getMessage());
    }

    // ── PRIVATE HELPER ────────────────────────────────────────────────────────
    private void send(String to, String subject, String template, Context context) {
        if (to != null && !emailLimiter.tryAcquire(to)) {
            log.error("[Email Throttled ✗] Rate limit exceeded for recipient '{}'. Skipping sending '{}'.", to, subject);
            return;
        }
        try {
            String html = templateEngine.process(template, context);
            MimeMessage msg = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(msg, true, "UTF-8");
            helper.setTo(to);
            helper.setSubject(subject);
            helper.setText(html, true);
            mailSender.send(msg);
            log.info("[Email ✓] '{}' sent to {}", subject, to);
        } catch (MessagingException e) {
            log.error("[Email ✗] Failed to send '{}' to {}: {}", subject, to, e.getMessage());
            throw new RuntimeException("Failed to send email", e);
        }
    }
}
