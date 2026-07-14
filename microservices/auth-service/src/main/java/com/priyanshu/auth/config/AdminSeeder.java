package com.priyanshu.auth.config;

import com.priyanshu.auth.entity.User;
import com.priyanshu.auth.entity.type.RoleType;
import com.priyanshu.auth.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import java.util.HashSet;
import java.util.Optional;
import java.util.Set;

@Component
@RequiredArgsConstructor
public class AdminSeeder implements CommandLineRunner {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    @Override
    public void run(String... args) {
        Optional<User> admin = userRepository.findByUsername("priyanshjais123@gmail.com");

        if (admin.isEmpty()) {
            User user = User.builder()
                    .fullName("Priyanshu")
                    .username("priyanshjais123@gmail.com")
                    .password(passwordEncoder.encode("2401301024"))
                    .emailVerified(true)
                    .authProvider("LOCAL")
                    .roles(Set.of(RoleType.ADMIN))
                    .build();

            userRepository.save(user);
            System.out.println("Default admin created: priyanshjais123@gmail.com (Password: 2401301024)");
        }
    }
}
