package com.example.DoAn.service;

import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.util.LinkedMultiValueMap;
import org.springframework.util.MultiValueMap;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.util.UriComponentsBuilder;

import java.util.Collections;
import java.util.List;
import java.util.Map;

@Slf4j
@Service
public class AiService {

    @Value("${ai.service.url:http://localhost:8000}")
    private String aiServiceUrl;

    private final RestTemplate restTemplate;

    public AiService(RestTemplate restTemplate) {
        this.restTemplate = restTemplate;
    }

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

    public Map<String, Object> getScreeningToday(String signal, String exchange, String industry) {
        return getForMap(
                "/screening/today",
                paramsOf(
                        "signal", signal,
                        "exchange", exchange,
                        "industry", industry
                )
        );
    }

    public Map<String, Object> getStockDetail(String symbol) {
        return getForMap("/stock/" + symbol.toUpperCase() + "/detail", new LinkedMultiValueMap<>());
    }

    public Map<String, Object> getScreeningHistory(Integer days) {
        return getForMap("/screening/history", paramsOf("days", days));
    }

    public Map<String, Object> getMarketOverview() {
        return getForMap("/market/overview", new LinkedMultiValueMap<>());
    }

    public List<Map<String, Object>> getLatestPredictions(Integer limit) {
        return getForList("/predictions/latest", paramsOf("limit", limit));
    }

    private Map<String, Object> getForMap(String path, MultiValueMap<String, String> params) {
        try {
            String url = buildUrl(path, params);
            log.info("Calling AI service: {}", url);
            Map<String, Object> response = restTemplate.getForObject(url, Map.class);
            return response != null ? response : Collections.emptyMap();
        } catch (Exception e) {
            log.error("Error calling AI service {}: {}", path, e.getMessage());
            return Collections.singletonMap("error", e.getMessage());
        }
    }

    @SuppressWarnings("unchecked")
    private List<Map<String, Object>> getForList(String path, MultiValueMap<String, String> params) {
        try {
            String url = buildUrl(path, params);
            log.info("Calling AI service: {}", url);
            List<Map<String, Object>> response = restTemplate.getForObject(url, List.class);
            return response != null ? response : List.of();
        } catch (Exception e) {
            log.error("Error calling AI service {}: {}", path, e.getMessage());
            return List.of(Collections.singletonMap("error", e.getMessage()));
        }
    }

    private String buildUrl(String path, MultiValueMap<String, String> params) {
        return UriComponentsBuilder
                .fromUriString(aiServiceUrl) // Đổi thành fromUriString theo gợi ý của IDE
                .path(path)                  // Thêm path
                .queryParams(params)
                .build()
                .toUriString();
    }

    private MultiValueMap<String, String> paramsOf(Object... values) {
        MultiValueMap<String, String> params = new LinkedMultiValueMap<>();
        for (int i = 0; i < values.length; i += 2) {
            Object key = values[i];
            Object value = values[i + 1];
            if (key != null && value != null && !value.toString().isBlank()) {
                params.add(key.toString(), value.toString());
            }
        }
        return params;
    }
}
