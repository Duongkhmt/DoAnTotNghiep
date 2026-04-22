package com.example.DoAn.exception; // Đổi lại package cho đúng dự án hiện tại

import lombok.Getter;
import org.springframework.http.HttpStatus;
import org.springframework.http.HttpStatusCode;

@Getter
public enum ErrorCode {
    // --- Lỗi hệ thống chung (99xx) ---
    UNCATEGORIZED_EXCEPTION(9999, "Lỗi hệ thống không xác định", HttpStatus.INTERNAL_SERVER_ERROR),
    INVALID_KEY(1001, "Key không hợp lệ", HttpStatus.BAD_REQUEST),

    // --- Lỗi User & Auth (10xx) ---
    USER_EXISTED(1001, "Người dùng đã tồn tại", HttpStatus.BAD_REQUEST),
    USER_NOT_EXISTED(1002, "Người dùng không tồn tại", HttpStatus.NOT_FOUND),
    UNAUTHENTICATED(1003, "Chưa đăng nhập hoặc token không hợp lệ", HttpStatus.UNAUTHORIZED),
    UNAUTHORIZED(1004, "Bạn không có quyền truy cập", HttpStatus.FORBIDDEN),
    // Thêm các dòng này vào Enum
    PASSWORD_MISMATCH(1006, "Mật khẩu xác nhận không khớp", HttpStatus.BAD_REQUEST),
    INVALID_RESET_TOKEN(1007, "Token không hợp lệ hoặc đã hết hạn", HttpStatus.UNAUTHORIZED),

    // --- Lỗi Nghiệp vụ Chứng khoán (20xx) ---
    STOCK_NOT_FOUND(2001, "Mã chứng khoán không tồn tại", HttpStatus.NOT_FOUND),
    INSUFFICIENT_BALANCE(2002, "Số dư tài khoản không đủ để thực hiện giao dịch", HttpStatus.BAD_REQUEST),
    NOT_ENOUGH_STOCK(2003, "Số lượng cổ phiếu trong ví không đủ để bán", HttpStatus.BAD_REQUEST),
    PORTFOLIO_NOT_FOUND(2004, "Bạn chưa sở hữu mã cổ phiếu này", HttpStatus.BAD_REQUEST),
    MARKET_CLOSED(2005, "Thị trường hiện đang đóng cửa", HttpStatus.BAD_REQUEST),

    // --- Lỗi AI/Dữ liệu (30xx) ---
    AI_SERVICE_ERROR(3001, "Không thể kết nối tới dịch vụ dự báo AI", HttpStatus.SERVICE_UNAVAILABLE);

    ErrorCode(int code, String message, HttpStatusCode httpStatusCode) {
        this.code = code;
        this.message = message;
        this.httpStatusCode = httpStatusCode;
    }

    private final int code;
    private final String message;
    private final HttpStatusCode httpStatusCode;
}
