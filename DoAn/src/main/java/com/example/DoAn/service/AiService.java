package com.example.DoAn.service;

import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.util.Collections;
import java.util.Map;

@Slf4j
@Service
public class AiService {

    @Value("${ai.service.url:http://localhost:8000}")
    private String aiServiceUrl;

    private final RestTemplate restTemplate = new RestTemplate();

    /**
     * Kích hoạt dự đoán hàng ngày cho tất cả các mã.
     */
    public Map<String, Object> triggerDailyPrediction() {
        try {
            String url = aiServiceUrl + "/daily_predict_all";
            log.info("Triggering AI Daily Prediction: {}", url);
            return restTemplate.postForObject(url, null, Map.class);
        } catch (Exception e) {
            log.error("Error triggering AI prediction: {}", e.getMessage());
            return Collections.singletonMap("error", e.getMessage());
        }
    }

    /**
     * Dự đoán ngay lập tức cho danh sách mã cụ thể.
     */
    public Map<String, Object> predictNow(String[] symbols) {
        try {
            String url = aiServiceUrl + "/predict_now";
            log.info("Triggering AI Predict Now for: {}", (Object) symbols);
            return restTemplate.postForObject(url, symbols, Map.class);
        } catch (Exception e) {
            log.error("Error triggering AI predict now: {}", e.getMessage());
            return Collections.singletonMap("error", e.getMessage());
        }
    }
}
