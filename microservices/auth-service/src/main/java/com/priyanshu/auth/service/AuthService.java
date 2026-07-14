package com.priyanshu.auth.service;

import com.priyanshu.auth.dto.*;
import com.priyanshu.auth.entity.User;
import com.priyanshu.auth.entity.type.RoleType;
import com.priyanshu.auth.events.OtpSendEvent;
import com.priyanshu.auth.repository.UserRepository;
import com.priyanshu.auth.security.JWTService;
import lombok.RequiredArgsConstructor;
import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.Set;

@Service
@RequiredArgsConstructor
public class AuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final OtpService otpService;
    private final AuthenticationManager authenticationManager;
    private final JWTService jwtService;
    private final KafkaTemplate<String, Object> kafkaTemplate;

    // ── INTERNAL USER CREATION (Called by other microservices) ───────────────
    public Long createInternalUser(String username, String password, String fullName, String phone, RoleType role) {
        if (userRepository.existsByUsername(username)) {
            throw new RuntimeException("Username already registered: " + username);
        }
        User user = User.builder()
                .username(username)
                .password(passwordEncoder.encode(password))
                .fullName(fullName)
                .phone(phone)
                .emailVerified(true)
                .authProvider("LOCAL")
                .roles(Set.of(role))
                .build();
        User saved = userRepository.save(user);
        return saved.getId();
    }

    // ── SIGNUP ────────────────────────────────────────────────────────────────
    public String signup(SignUpRequestDto dto) {
        if (userRepository.existsByUsername(dto.getUsername())) {
            throw new RuntimeException("Email already registered");
        }

        String otp = otpService.generateOtp();

        User user = User.builder()
                .username(dto.getUsername())
                .password(passwordEncoder.encode(dto.getPassword()))
                .fullName(dto.getFullName())
                .phone(dto.getPhone())
                .emailVerified(false)
                .otp(otp)
                .otpExpiry(LocalDateTime.now().plusMinutes(5))
                .authProvider("LOCAL")
                .roles(Set.of(RoleType.PATIENT))
                .build();

        userRepository.save(user);

        // Publish OTP event → notification-service sends email
        kafkaTemplate.send("otp.send",
                new OtpSendEvent(dto.getUsername(), otp, "SIGNUP"));

        return "User registered. OTP sent to email.";
    }

    // ── VERIFY OTP ────────────────────────────────────────────────────────────
    @Transactional
    public String verifyOtp(VerifyOtpRequestDto dto) {
        User user = userRepository.findByUsername(dto.getEmail())
                .orElseThrow(() -> new RuntimeException("User not found"));

        if (!user.getOtp().equals(dto.getOtp())) {
            throw new RuntimeException("Invalid OTP");
        }
        if (user.getOtpExpiry().isBefore(LocalDateTime.now())) {
            throw new RuntimeException("OTP expired");
        }

        user.setEmailVerified(true);
        user.setOtp(null);
        user.setOtpExpiry(null);
        userRepository.save(user);

        return "Email verified successfully";
    }

    // ── LOGIN ─────────────────────────────────────────────────────────────────
    public LoginResponseDto login(LoginRequestDto dto) {
        authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(dto.getUsername(), dto.getPassword()));

        User user = userRepository.findByUsername(dto.getUsername())
                .orElseThrow(() -> new UsernameNotFoundException("User not found"));

        if (user.getRoles().contains(RoleType.PATIENT) && !user.isEmailVerified()) {
            throw new RuntimeException("Please verify your email first");
        }

        String token = jwtService.generateToken(user);
        return new LoginResponseDto(token, user.getId(), user.getRoles().iterator().next().name());
    }

    // ── FORGOT PASSWORD ────────────────────────────────────────────────────────
    @Transactional
    public String forgotPassword(String email) {
        User user = userRepository.findByUsername(email)
                .orElseThrow(() -> new RuntimeException("User not found"));

        String otp = otpService.generateOtp();
        user.setOtp(otp);
        user.setOtpExpiry(LocalDateTime.now().plusMinutes(5));
        userRepository.save(user);

        kafkaTemplate.send("otp.send", new OtpSendEvent(email, otp, "FORGOT_PASSWORD"));

        return "OTP sent to email";
    }

    // ── RESET PASSWORD ─────────────────────────────────────────────────────────
    @Transactional
    public String resetPassword(ResetPasswordRequestDto dto) {
        User user = userRepository.findByUsername(dto.getEmail())
                .orElseThrow(() -> new RuntimeException("User not found"));

        if (!user.getOtp().equals(dto.getOtp())) {
            throw new RuntimeException("Invalid OTP");
        }
        if (user.getOtpExpiry().isBefore(LocalDateTime.now())) {
            throw new RuntimeException("OTP expired");
        }
        if (!dto.getNewPassword().equals(dto.getConfirmPassword())) {
            throw new RuntimeException("Passwords do not match");
        }

        user.setPassword(passwordEncoder.encode(dto.getNewPassword()));
        user.setOtp(null);
        user.setOtpExpiry(null);
        userRepository.save(user);

        return "Password reset successfully";
    }

    // ── CHANGE PASSWORD ────────────────────────────────────────────────────────
    @Transactional
    public String changePassword(ChangePasswordRequestDto dto, String username) {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("User not found"));

        if (!passwordEncoder.matches(dto.getOldPassword(), user.getPassword())) {
            throw new RuntimeException("Old password is incorrect");
        }
        if (!dto.getNewPassword().equals(dto.getConfirmPassword())) {
            throw new RuntimeException("Passwords do not match");
        }

        user.setPassword(passwordEncoder.encode(dto.getNewPassword()));
        userRepository.save(user);

        return "Password changed successfully";
    }

    // ── RESEND OTP ─────────────────────────────────────────────────────────────
    @Transactional
    public String resendOtp(String email) {
        User user = userRepository.findByUsername(email)
                .orElseThrow(() -> new RuntimeException("User not found"));

        String otp = otpService.generateOtp();
        user.setOtp(otp);
        user.setOtpExpiry(LocalDateTime.now().plusMinutes(5));
        userRepository.save(user);

        kafkaTemplate.send("otp.send", new OtpSendEvent(email, otp, "RESEND"));

        return "OTP resent successfully";
    }
}
