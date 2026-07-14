package com.priyanshu.auth.entity;

import com.priyanshu.auth.entity.type.RoleType;
import jakarta.persistence.*;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import lombok.*;

import java.time.LocalDateTime;
import java.util.HashSet;
import java.util.Set;

@Entity
@Table(name = "app_user")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class User {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Email
    @Column(unique = true, nullable = false)
    private String username;   // email address

    private String password;

    @Size(min = 3, max = 60)
    private String fullName;

    @Pattern(regexp = "^[6-9]\\d{9}$", message = "Invalid phone number")
    @Column(unique = true)
    private String phone;

    private boolean emailVerified;

    private String otp;

    private LocalDateTime otpExpiry;

    /** OAuth2 provider: LOCAL | GOOGLE */
    private String authProvider;

    @Builder.Default
    @ElementCollection(fetch = FetchType.EAGER)
    @Enumerated(EnumType.STRING)
    @CollectionTable(name = "user_roles", joinColumns = @JoinColumn(name = "user_id"))
    @Column(name = "role")
    Set<RoleType> roles = new HashSet<>();
}
