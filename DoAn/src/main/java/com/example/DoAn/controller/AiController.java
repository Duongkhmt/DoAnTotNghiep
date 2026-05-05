package com.example.DoAn.controller;

import com.example.DoAn.service.AiService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/ai")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class AiController {

    private final AiService aiService;

    @PostMapping("/trigger-prediction")
    public ResponseEntity<Map<String, Object>> triggerPrediction() {
        return ResponseEntity.ok(aiService.triggerDailyPrediction());
    }

    @PostMapping("/predict-now")
    public ResponseEntity<Map<String, Object>> predictNow(@RequestBody(required = false) String[] symbols) {
        if (symbols == null || symbols.length == 0) {
            return ResponseEntity.ok(aiService.triggerDailyPrediction());
        }
        return ResponseEntity.ok(aiService.predictNow(symbols));
    }

    @GetMapping("/screening/today")
    public ResponseEntity<Map<String, Object>> getScreeningToday(
            @RequestParam(defaultValue = "ALL") String signal,
            @RequestParam(required = false) String exchange,
            @RequestParam(required = false) String industry) {
        return ResponseEntity.ok(aiService.getScreeningToday(signal, exchange, industry));
    }

    @GetMapping("/screening/history")
    public ResponseEntity<Map<String, Object>> getScreeningHistory(
            @RequestParam(defaultValue = "30") Integer days) {
        return ResponseEntity.ok(aiService.getScreeningHistory(days));
    }

    @GetMapping("/market/overview")
    public ResponseEntity<Map<String, Object>> getMarketOverview() {
        return ResponseEntity.ok(aiService.getMarketOverview());
    }

    @GetMapping("/stock/{symbol}/detail")
    public ResponseEntity<Map<String, Object>> getStockDetail(@PathVariable String symbol) {
        return ResponseEntity.ok(aiService.getStockDetail(symbol));
    }

    @GetMapping("/predictions/latest")
    public ResponseEntity<List<Map<String, Object>>> getLatestPredictions(
            @RequestParam(defaultValue = "20") Integer limit) {
        return ResponseEntity.ok(aiService.getLatestPredictions(limit));
    }
}
