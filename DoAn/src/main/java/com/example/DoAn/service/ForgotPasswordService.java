//package com.example.DoAn.service;
//
//import com.example.DoAn.dto.request.ForgotPasswordRequest;
//import com.example.DoAn.dto.request.ResetPasswordRequest;
//import com.example.DoAn.entity.User;
//import com.example.DoAn.exception.ApplicationException;
//import com.example.DoAn.exception.ErrorCode;
//import com.example.DoAn.repository.UserRepository;
//import lombok.RequiredArgsConstructor;
//import org.springframework.security.crypto.password.PasswordEncoder;
//import org.springframework.stereotype.Service;
//
//@Service
//@RequiredArgsConstructor
//public class ForgotPasswordService {
//
//    private final UserRepository userRepository;
//    private final EmailService emailService;
//    private final PasswordEncoder passwordEncoder;
//    private final RedisService redisService;
//
//    // 1. Gửi yêu cầu quên mật khẩu
//    public void sendResetPasswordEmail(ForgotPasswordRequest request) {
//        // Kiểm tra email có tồn tại không
//        if (!userRepository.existsByEmail(request.getEmail())) {
//            // Để bảo mật, dù email không tồn tại ta vẫn báo thành công (tránh hacker dò email)
//            // Hoặc ném lỗi nếu muốn UX rõ ràng
//            throw new ApplicationException(ErrorCode.USER_NOT_EXISTED);
//        }
//
//        // Tạo token lưu Redis
//        String token = redisService.createResetToken(request.getEmail());
//
//        // Gửi email
//        emailService.sendResetPasswordEmail(request.getEmail(), token);
//    }
//
//    // 2. Xử lý đặt lại mật khẩu mới
//    public void resetPassword(ResetPasswordRequest request) {
//        // Check mật khẩu khớp nhau
//        if (!request.getNewPassword().equals(request.getConfirmPassword())) {
//            throw new ApplicationException(ErrorCode.PASSWORD_MISMATCH); // Bạn cần thêm mã lỗi này
//        }
//
//        // Lấy email từ token trong Redis
//        String email = redisService.getEmailByToken(request.getToken());
//        if (email == null) {
//            throw new ApplicationException(ErrorCode.INVALID_RESET_TOKEN); // Token hết hạn hoặc sai
//        }
//
//        // Tìm user để đổi pass
//        User user = userRepository.findByEmail(email)
//                .orElseThrow(() -> new ApplicationException(ErrorCode.USER_NOT_EXISTED));
//
//        // Mã hóa pass mới và lưu
//        user.setPassword(passwordEncoder.encode(request.getNewPassword()));
//        userRepository.save(user);
//
//        // Xóa token sau khi dùng xong
//        redisService.deleteToken(request.getToken());
//    }
//}
