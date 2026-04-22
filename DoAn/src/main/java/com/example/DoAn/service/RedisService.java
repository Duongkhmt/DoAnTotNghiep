package com.example.DoAn.service;

import lombok.RequiredArgsConstructor;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.stereotype.Service;

import java.util.UUID;
import java.util.concurrent.TimeUnit;

@Service
@RequiredArgsConstructor
public class RedisService {

    private final StringRedisTemplate redisTemplate;

    // Tạo token ngẫu nhiên và lưu vào Redis với key là Token, value là Email
    public String createResetToken(String email) {
        String token = UUID.randomUUID().toString();
        // Lưu tồn tại trong 10 phút
        redisTemplate.opsForValue().set(token, email, 10, TimeUnit.MINUTES);
        return token;
    }

    public String getEmailByToken(String token) {
        return redisTemplate.opsForValue().get(token);
    }

    public void deleteToken(String token) {
        redisTemplate.delete(token);
    }
}