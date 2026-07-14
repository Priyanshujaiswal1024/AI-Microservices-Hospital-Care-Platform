package com.priyanshu.doctor.client;

import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import lombok.Data;
import lombok.AllArgsConstructor;
import lombok.NoArgsConstructor;

@FeignClient(name = "auth-service", url = "${auth.service.url}")
public interface AuthClient {

    @PostMapping("/api/v1/auth/internal/create-user")
    Long createInternalUser(@RequestBody CreateInternalUserRequestDto request);

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    class CreateInternalUserRequestDto {
        private String username;
        private String password;
        private String fullName;
        private String phone;
        private String role; // RoleType name, e.g. "DOCTOR"
    }
}
