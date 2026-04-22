package com.example.DoAn.service;

import com.example.DoAn.dto.LoginGoogleDTO;
import com.example.DoAn.dto.request.UserCreateRequest;
import com.example.DoAn.dto.response.UserResponse;
import com.example.DoAn.entity.User;
import com.example.DoAn.exception.*;
import com.example.DoAn.mapper.UserMapper;
import com.example.DoAn.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class UserService {
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final UserMapper userMapper;

    public UserResponse createUser(UserCreateRequest request) {
        if (userRepository.existsByUsername(request.getUsername()))
            throw new ApplicationException(ErrorCode.USER_EXISTED);

        User user = User.builder()
                .username(request.getUsername())
                .password(passwordEncoder.encode(request.getPassword()))
                .email(request.getEmail())
                .address(request.getAddress())
                .phoneNumber(request.getPhoneNumber())
                .build();

        return userMapper.toUserResponse(userRepository.save(user));
    }

    // Logic tạo user từ Google DTO
    public UserResponse createUserWithGoogle(LoginGoogleDTO dto) {
        if (userRepository.existsByEmail(dto.getEmail())) {
            return null; // Đã tồn tại thì không tạo nữa
        }
        String baseName = dto.getFullName();
        String finalUsername = baseName;
        int counter = 1;

        while (userRepository.existsByUsername(finalUsername)) {
            finalUsername = baseName + " " + counter;
            counter++;
        }

        User newUser = User.builder()
                .email(dto.getEmail())
                .username(finalUsername) // Lấy tên Google làm username
                .password(null) // Không có pass
                .avatarUrl(dto.getAvatarUrl())
                .providerId(dto.getProviderId())
                .createdAt(dto.getCreatedAt())
                .address("Google Account")
                .build();

        return userMapper.toUserResponse(userRepository.save(newUser));
    }

    public UserResponse getMyInfo() {
        var context = SecurityContextHolder.getContext();
        String name = context.getAuthentication().getName();
        User user = userRepository.findByEmail(name)
                .orElseThrow(() -> new ApplicationException(ErrorCode.USER_NOT_EXISTED));
        return userMapper.toUserResponse(user);
    }

}