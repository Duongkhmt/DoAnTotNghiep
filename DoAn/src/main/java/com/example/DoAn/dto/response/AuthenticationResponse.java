package com.example.DoAn.dto.response;
import lombok.*;

@Data
@Builder
public class AuthenticationResponse {
    private String token;
    private boolean authenticated;
    private UserResponse user;
}