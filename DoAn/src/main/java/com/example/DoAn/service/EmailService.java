//package com.example.DoAn.service;
//
//import com.sendgrid.Method;
//import com.sendgrid.Request;
//import com.sendgrid.Response;
//import com.sendgrid.SendGrid;
//import com.sendgrid.helpers.mail.Mail;
//import com.sendgrid.helpers.mail.objects.Content;
//import com.sendgrid.helpers.mail.objects.Email;
//import lombok.RequiredArgsConstructor;
//import org.slf4j.Logger;
//import org.slf4j.LoggerFactory;
//import org.springframework.beans.factory.annotation.Value;
//import org.springframework.stereotype.Service;
//
//import java.io.IOException;
//
//@Service
//@RequiredArgsConstructor
//public class EmailService {
//
//    private static final Logger logger = LoggerFactory.getLogger(EmailService.class);
//    private final SendGrid sendGrid;
//
//    @Value("${spring.sendgrid.from-email}")
//    private String fromEmail;
//
//    @Value("${app.frontend.url}") // <--- Thêm dòng này
//    private String frontendUrl;
//
//    public void sendResetPasswordEmail(String toEmail, String token) {
//        String resetLink = frontendUrl+ "/reset-password.html?token=" + token;
//
//        // Nội dung Email (HTML)
//        String emailContent = "<h3>Xin chào,</h3>" +
//                "<p>Bạn đã yêu cầu đặt lại mật khẩu cho tài khoản StockAI.</p>" +
//                "<p>Vui lòng nhấp vào nút dưới đây để đặt lại mật khẩu:</p>" +
//                "<a href=\"" + resetLink + "\" style=\"background-color: #4f46e5; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;\">Đặt lại mật khẩu</a>" +
//                "<p>Hoặc copy đường dẫn sau: " + resetLink + "</p>" +
//                "<p>Link này sẽ hết hạn sau 10 phút.</p>";
//
//        // Tạo đối tượng Mail của SendGrid
//        Email from = new Email(fromEmail);
//        String subject = "Yêu cầu đặt lại mật khẩu - StockAI";
//        Email to = new Email(toEmail);
//        Content content = new Content("text/html", emailContent);
//
//        Mail mail = new Mail(from, subject, to, content);
//
//        // Gửi Request lên SendGrid API
//        Request request = new Request();
//        try {
//            request.setMethod(Method.POST);
//            request.setEndpoint("mail/send");
//            request.setBody(mail.build());
//
//            Response response = sendGrid.api(request);
//
//            if (response.getStatusCode() >= 200 && response.getStatusCode() < 300) {
//                logger.info("Email sent successfully to {}", toEmail);
//            } else {
//                logger.error("Failed to send email. Status Code: {}", response.getStatusCode());
//            }
//        } catch (IOException ex) {
//            logger.error("Error sending email via SendGrid", ex);
//            throw new RuntimeException("Lỗi khi gửi email xác thực");
//        }
//    }
//}