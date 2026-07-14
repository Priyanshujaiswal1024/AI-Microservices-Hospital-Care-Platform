package com.priyanshu.auth.service;

import org.springframework.stereotype.Service;

import java.security.SecureRandom;

@Service
public class OtpService {
    private static final SecureRandom RANDOM = new SecureRandom();

    public String generateOtp() {
        int otp = 100000 + RANDOM.nextInt(900000);
        return String.valueOf(otp);
    }
}
