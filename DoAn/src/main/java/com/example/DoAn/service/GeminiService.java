package com.example.DoAn.service;

import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.net.URI;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Slf4j
@Service
public class GeminiService {

    @Value("${gemini.api.key:}")
    private String apiKey;

    private static final String GEMINI_API_URL =
            "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=";

    private final RestTemplate restTemplate = new RestTemplate();

    public String summarize(String content) {
        if (apiKey == null || apiKey.isEmpty()) {
            log.warn("Gemini API key is not configured.");
            return "AI Summary is not available (API Key missing).";
        }

        try {
            String prompt = "Tóm tắt bài báo sau đây thành 3-5 ý chính ngắn gọn, súc tích bằng tiếng Việt:\n\n"
                    + content;

            Map<String, Object> requestBody = new HashMap<>();
            Map<String, Object> contentMap = new HashMap<>();
            Map<String, Object> partMap = new HashMap<>();
            partMap.put("text", prompt);
            contentMap.put("parts", List.of(partMap));
            requestBody.put("contents", List.of(contentMap));

            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);

            HttpEntity<Map<String, Object>> entity = new HttpEntity<>(requestBody, headers);

            // Sử dụng java.net.URI để tránh RestTemplate tự động encode dấu ':'
            java.net.URI uri = new java.net.URI(GEMINI_API_URL + apiKey);
            Map<String, Object> response = restTemplate.postForObject(uri, entity, Map.class);

            if (response != null && response.containsKey("candidates")) {
                List<Map<String, Object>> candidates = (List<Map<String, Object>>) response.get("candidates");
                if (!candidates.isEmpty()) {
                    Map<String, Object> candidate = candidates.get(0);
                    Map<String, Object> outputContent = (Map<String, Object>) candidate.get("content");
                    List<Map<String, Object>> parts = (List<Map<String, Object>>) outputContent.get("parts");
                    if (!parts.isEmpty()) {
                        return (String) parts.get(0).get("text");
                    }
                }
            }

            return "Không thể tạo tóm tắt vào lúc này.";
        } catch (org.springframework.web.client.HttpClientErrorException.TooManyRequests e) {
            return "Bạn đã vượt quá giới hạn yêu cầu miễn phí của AI (Rate Limit). Vui lòng thử lại sau 1-2 phút.";
        } catch (Exception e) {
            log.error("Error calling Gemini API: {}", e.getMessage());
            if (e.getMessage().contains("429")) {
                return "AI đang bận (Quá tải yêu cầu). Vui lòng thử lại sau giây lát.";
            }
            return "Lỗi khi gọi AI: " + e.getMessage();
        }
    }
}
