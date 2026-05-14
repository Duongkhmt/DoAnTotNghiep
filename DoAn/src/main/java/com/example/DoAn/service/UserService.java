package com.example.DoAn.service;

import com.example.DoAn.dto.LoginGoogleDTO;
import com.example.DoAn.dto.request.UserCreateRequest;
import com.example.DoAn.dto.request.UserUpdateRequest;
import com.example.DoAn.dto.response.UserResponse;
import com.example.DoAn.entity.User;
import com.example.DoAn.exception.*;
import com.example.DoAn.mapper.UserMapper;
import com.example.DoAn.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.util.UUID;

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

    public UserResponse updateMyInfo(UserUpdateRequest request) {
        var context = SecurityContextHolder.getContext();
        String name = context.getAuthentication().getName();
        User user = userRepository.findByEmail(name)
                .orElseThrow(() -> new ApplicationException(ErrorCode.USER_NOT_EXISTED));

        user.setUsername(request.getUsername());
        user.setAddress(request.getAddress());
        user.setPhoneNumber(request.getPhoneNumber());

        return userMapper.toUserResponse(userRepository.save(user));
    }

    public UserResponse updateAvatar(MultipartFile file) {
        var context = SecurityContextHolder.getContext();
        String name = context.getAuthentication().getName();
        User user = userRepository.findByEmail(name)
                .orElseThrow(() -> new ApplicationException(ErrorCode.USER_NOT_EXISTED));

        try {
            String fileName = UUID.randomUUID().toString() + "_" + file.getOriginalFilename();
            Path uploadPath = Paths.get("uploads/avatars");

            if (!Files.exists(uploadPath)) {
                Files.createDirectories(uploadPath);
            }

            Path filePath = uploadPath.resolve(fileName);
            Files.copy(file.getInputStream(), filePath, StandardCopyOption.REPLACE_EXISTING);

            // Lưu URL vào DB (đường dẫn tương đối phục vụ API)
            String avatarUrl = "/api/users/images/" + fileName;
            user.setAvatarUrl(avatarUrl);

            return userMapper.toUserResponse(userRepository.save(user));
        } catch (IOException e) {
            throw new ApplicationException(ErrorCode.UNCATEGORIZED_EXCEPTION);
        }
    }

}