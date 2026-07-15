package com.priyanshu.auth;

import com.priyanshu.auth.entity.User;
import com.priyanshu.auth.entity.type.RoleType;
import com.priyanshu.auth.repository.UserRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.context.annotation.Bean;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.client.RestTemplate;

import java.util.Set;

@SpringBootApplication
public class AuthServiceApplication {
    public static void main(String[] args) {
        SpringApplication.run(AuthServiceApplication.class, args);
    }

    @Bean
    public CommandLineRunner seedAdmin(UserRepository userRepository, PasswordEncoder passwordEncoder) {
        return args -> {
            String adminEmail = "priyanshjais123@gmail.com";
            if (!userRepository.existsByUsername(adminEmail)) {
                User admin = User.builder()
                        .username(adminEmail)
                        .password(passwordEncoder.encode("2401301024"))
                        .fullName("System Admin")
                        .phone("9999999999")
                        .emailVerified(true)
                        .authProvider("LOCAL")
                        .roles(Set.of(RoleType.ADMIN))
                        .build();
                userRepository.save(admin);
                System.out.println("Admin user seeded successfully with email: " + adminEmail);
            } else {
                System.out.println("Admin user already exists. Skipping seeding.");
            }
        };
    }

    @Bean
    public RestTemplate restTemplate() {
        return new RestTemplate();
    }
}
