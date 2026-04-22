package com.example.DoAn.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "users")
@Data
@Builder           // <--- Cần cái này để dùng .builder()
@NoArgsConstructor // <--- Cần cái này cho JPA/Hibernate
@AllArgsConstructor // <--- Cần cái này để @Builder hoạt động
public class User {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(unique = true, nullable = false)
    private String email;


    @Column(name = "password")
    private String password; // Mật khẩu (sẽ mã hóa BCrypt)

    @Column(nullable = false)
    private String username;

    @Column(name = "address")
    private String address;

    @Column(name = "phone_number", length = 10)
    private String phoneNumber;

    @Column(name = "avatar_url")
    private String avatarUrl;

    @Column(name = "provider_id")
    private String providerId;

    @Column(updatable = false)
    @Builder.Default
    private LocalDateTime createdAt = LocalDateTime.now();

}