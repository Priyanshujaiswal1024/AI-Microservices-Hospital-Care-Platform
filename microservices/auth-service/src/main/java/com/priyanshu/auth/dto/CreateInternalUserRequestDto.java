package com.priyanshu.auth.dto;

import com.priyanshu.auth.entity.type.RoleType;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class CreateInternalUserRequestDto {
    private String username;
    private String password;
    private String fullName;
    private String phone;
    private RoleType role;
}
