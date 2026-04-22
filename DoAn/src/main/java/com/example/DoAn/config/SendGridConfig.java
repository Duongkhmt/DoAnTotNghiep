//package com.example.DoAn.config;
//
//import com.sendgrid.SendGrid;
//import org.springframework.beans.factory.annotation.Value;
//import org.springframework.context.annotation.Bean;
//import org.springframework.context.annotation.Configuration;
//
//@Configuration
//public class SendGridConfig {
//
//    @Value("${spring.sendgrid.api-key}")
//    private String sendGridApiKey;
//
//    @Bean
//    public SendGrid sendGrid() {
//        System.out.println("SendGrid Key: " + sendGridApiKey);
//        return new SendGrid(sendGridApiKey);
//    }
//}