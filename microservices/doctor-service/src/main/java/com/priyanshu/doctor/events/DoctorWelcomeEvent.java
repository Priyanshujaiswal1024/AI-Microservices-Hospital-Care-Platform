package com.priyanshu.doctor.events;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class DoctorWelcomeEvent {
    private String doctorEmail;
    private String doctorName;
    private String tempPassword;
}
