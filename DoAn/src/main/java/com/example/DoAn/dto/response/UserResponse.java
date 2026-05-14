package com.example.DoAn.dto.response;
import lombok.*;
import java.time.LocalDateTime;

@Data
@Builder
public class UserResponse {
    private Long id;
    private String username;
    private String email;
    private String avatarUrl;
    private String address;
    private String phoneNumber;
    private LocalDateTime createdAt;
}