package com.example.DoAn.dto;

import lombok.*;
import java.time.LocalDateTime;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class LoginGoogleDTO {
    private String fullName; // Ánh xạ từ Google Name
    private String email;
    private String avatarUrl;
    private LocalDateTime createdAt;
    private String providerId;
}