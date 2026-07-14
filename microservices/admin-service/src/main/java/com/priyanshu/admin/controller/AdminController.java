package com.priyanshu.admin.controller;

import com.priyanshu.admin.client.AuthClient;
import com.priyanshu.admin.dto.CreateAdminRequestDto;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/admin")
@RequiredArgsConstructor
public class AdminController {

    private final AuthClient authClient;

    @PostMapping("/create-admin")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Long> createAdmin(@RequestBody CreateAdminRequestDto dto) {
        AuthClient.CreateInternalUserRequestDto authRequest = new AuthClient.CreateInternalUserRequestDto(
                dto.getUsername(),
                dto.getPassword(),
                "Admin User",
                null,
                "ADMIN"
        );
        Long userId = authClient.createInternalUser(authRequest);
        return ResponseEntity.ok(userId);
    }
}
