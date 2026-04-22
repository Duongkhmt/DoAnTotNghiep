//package com.example.DoAn.controller;
//
//import com.example.DoAn.dto.request.ForgotPasswordRequest;
//import com.example.DoAn.dto.request.ResetPasswordRequest;
//import com.example.DoAn.service.ForgotPasswordService;
//import io.swagger.v3.oas.annotations.Operation;
//import io.swagger.v3.oas.annotations.tags.Tag;
//import jakarta.validation.Valid;
//import lombok.RequiredArgsConstructor;
//import org.springframework.http.ResponseEntity;
//import org.springframework.web.bind.annotation.*;
//
//import java.util.Map;
//
//@RestController
//@RequestMapping("/auth")
//@RequiredArgsConstructor
//@Tag(name = "Forgot Password", description = "Quên mật khẩu và đặt lại mật khẩu")
//public class ForgotPasswordController {
//
//    private final ForgotPasswordService forgotPasswordService;
//
//    @Operation(summary = "Yêu cầu đặt lại mật khẩu (Gửi email)")
//    @PostMapping("/forgot-password")
//    public ResponseEntity<Map<String, String>> forgotPassword(@Valid @RequestBody ForgotPasswordRequest request) {
//        forgotPasswordService.sendResetPasswordEmail(request);
//
//        return ResponseEntity.ok(Map.of(
//                "message", "Nếu email tồn tại, một liên kết đặt lại mật khẩu đã được gửi."
//        ));
//    }
//
//    @Operation(summary = "Đặt lại mật khẩu mới (Có Token)")
//    @PostMapping("/reset-password")
//    public ResponseEntity<Map<String, String>> resetPassword(@Valid @RequestBody ResetPasswordRequest request) {
//        forgotPasswordService.resetPassword(request);
//
//        return ResponseEntity.ok(Map.of(
//                "message", "Mật khẩu đã được đặt lại thành công."
//        ));
//    }
//}