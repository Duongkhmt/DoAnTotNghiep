package com.example.DoAn.controller;

import com.example.DoAn.dto.request.UserUpdateRequest;
import com.example.DoAn.dto.response.UserResponse;
import com.example.DoAn.service.UserService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

@RestController
@RequestMapping("/api/users")
@RequiredArgsConstructor
@Tag(name = "User")
public class UserController {
    private final UserService userService;

    @Operation(summary = "Lấy thông tin cá nhân")
    @GetMapping("/my-info")
    public ResponseEntity<UserResponse> getMyInfo() {
        return ResponseEntity.ok(userService.getMyInfo());
    }

    @Operation(summary = "Cập nhật thông tin cá nhân")
    @PutMapping("/my-info")
    public ResponseEntity<UserResponse> updateMyInfo(@RequestBody UserUpdateRequest request) {
        return ResponseEntity.ok(userService.updateMyInfo(request));
    }

    @Operation(summary = "Cập nhật ảnh đại diện")
    @PostMapping("/avatar")
    public ResponseEntity<UserResponse> updateAvatar(@RequestParam("file") MultipartFile file) {
        return ResponseEntity.ok(userService.updateAvatar(file));
    }
}