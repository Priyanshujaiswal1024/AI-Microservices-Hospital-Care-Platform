package com.priyanshu.auth.controller;

import com.priyanshu.auth.dto.*;
import com.priyanshu.auth.entity.UserPrincipal;
import com.priyanshu.auth.service.AuthService;
import com.priyanshu.auth.util.RateLimiter;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

@RestController
@RequestMapping("/api/v1/auth")
@RequiredArgsConstructor
public class AuthController {

    private final AuthService authService;

    // Token Bucket Rate Limiters (refillRateMs = windowMs / maxTokens)
    // Login & OTP : 5 req/min  → 1 token per 12s  (60000ms / 5  = 12000ms)
    // Reset       : 3 req/5min → 1 token per 100s (300000ms / 3 = 100000ms)
    // Signup      : 3 req/hour → 1 token per 20min (IP-keyed, tightest limit)
    private final RateLimiter loginLimiter  = new RateLimiter(5, 12000);
    private final RateLimiter otpLimiter    = new RateLimiter(5, 12000);
    private final RateLimiter resetLimiter  = new RateLimiter(3, 100000);
    private final RateLimiter signupLimiter = new RateLimiter(3, 1200000);

    /** POST /api/v1/auth/signup */
    @PostMapping("/signup")
    public ResponseEntity<String> signup(@Valid @RequestBody SignUpRequestDto dto,
                                         HttpServletRequest request) {
        String clientIp = getClientIp(request);
        if (clientIp != null && !signupLimiter.tryAcquire(clientIp)) {
            throw new ResponseStatusException(HttpStatus.TOO_MANY_REQUESTS,
                    "Too many signup attempts. Max 3 per hour per IP.");
        }
        return ResponseEntity.ok(authService.signup(dto));
    }

    /** POST /api/v1/auth/verify-otp */
    @PostMapping("/verify-otp")
    public ResponseEntity<String> verifyOtp(@RequestBody VerifyOtpRequestDto dto) {
        if (dto.getEmail() != null && !otpLimiter.tryAcquire(dto.getEmail())) {
            throw new ResponseStatusException(HttpStatus.TOO_MANY_REQUESTS, "Too many OTP verification attempts. Try again in 1 minute.");
        }
        return ResponseEntity.ok(authService.verifyOtp(dto));
    }

    /** POST /api/v1/auth/login */
    @PostMapping("/login")
    public ResponseEntity<LoginResponseDto> login(@RequestBody LoginRequestDto dto) {
        if (dto.getUsername() != null && !loginLimiter.tryAcquire(dto.getUsername())) {
            throw new ResponseStatusException(HttpStatus.TOO_MANY_REQUESTS, "Too many login attempts. Try again in 1 minute.");
        }
        return ResponseEntity.ok(authService.login(dto));
    }

    /** POST /api/v1/auth/forgot-password?email=... */
    @PostMapping("/forgot-password")
    public ResponseEntity<String> forgotPassword(@RequestParam String email) {
        if (email != null && !resetLimiter.tryAcquire(email)) {
            throw new ResponseStatusException(HttpStatus.TOO_MANY_REQUESTS, "Too many password reset requests. Max 3 per 5 minutes.");
        }
        return ResponseEntity.ok(authService.forgotPassword(email));
    }

    /** POST /api/v1/auth/reset-password */
    @PostMapping("/reset-password")
    public ResponseEntity<String> resetPassword(@RequestBody ResetPasswordRequestDto dto) {
        return ResponseEntity.ok(authService.resetPassword(dto));
    }

    /** POST /api/v1/auth/change-password (Authenticated) */
    @PostMapping("/change-password")
    public ResponseEntity<String> changePassword(
            @RequestBody ChangePasswordRequestDto dto,
            @AuthenticationPrincipal UserPrincipal principal) {
        return ResponseEntity.ok(authService.changePassword(dto, principal.getUsername()));
    }

    /** POST /api/v1/auth/resend-otp?email=... */
    @PostMapping("/resend-otp")
    public ResponseEntity<String> resendOtp(@RequestParam String email) {
        if (email != null && !otpLimiter.tryAcquire(email)) {
            throw new ResponseStatusException(HttpStatus.TOO_MANY_REQUESTS, "Too many OTP resends. Try again in 1 minute.");
        }
        return ResponseEntity.ok(authService.resendOtp(email));
    }

    // ── Private Helpers ────────────────────────────────────────────────────────

    /**
     * Extracts real client IP.
     * Checks X-Forwarded-For first (set by load balancers like AWS ALB / Nginx).
     */
    private String getClientIp(HttpServletRequest request) {
        String forwarded = request.getHeader("X-Forwarded-For");
        if (forwarded != null && !forwarded.isBlank()) {
            return forwarded.split(",")[0].trim();
        }
        return request.getRemoteAddr();
    }

    /** GET /api/v1/auth/validate - called by API Gateway to validate JWT */
    @GetMapping("/validate")
    public ResponseEntity<String> validate(@AuthenticationPrincipal UserPrincipal principal) {
        return ResponseEntity.ok("Valid: userId=" + principal.getId());
    }

    /** POST /api/v1/auth/internal/create-user */
    @PostMapping("/internal/create-user")
    public ResponseEntity<Long> createInternalUser(@RequestBody CreateInternalUserRequestDto dto) {
        Long userId = authService.createInternalUser(
                dto.getUsername(),
                dto.getPassword(),
                dto.getFullName(),
                dto.getPhone(),
                dto.getRole()
        );
        return ResponseEntity.ok(userId);
    }
}
