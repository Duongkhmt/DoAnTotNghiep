package com.example.DoAn.controller;

import com.example.DoAn.dto.ai.AiLatestPredictionDto;
import com.example.DoAn.dto.ai.AiMarketOverviewResponse;
import com.example.DoAn.dto.ai.AiScreeningHistoryResponse;
import com.example.DoAn.dto.ai.AiScreeningTodayResponse;
import com.example.DoAn.dto.ai.AiStockDetailResponse;
import com.example.DoAn.service.AiService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/ai")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class AiController {

    private final AiService aiService;

    @GetMapping("/screening/today")
    public ResponseEntity<AiScreeningTodayResponse> getScreeningToday(
            @RequestParam(defaultValue = "ALL") String signal,
            @RequestParam(required = false) String exchange,
            @RequestParam(required = false) String industry) {
        return ResponseEntity.ok(aiService.getScreeningToday(signal, exchange, industry));
    }

    @GetMapping({"/history", "/screening/history"})
    public ResponseEntity<AiScreeningHistoryResponse> getScreeningHistory(
            @RequestParam(defaultValue = "30") Integer days) {
        return ResponseEntity.ok(aiService.getScreeningHistory(days));
    }

    @GetMapping({"/overview", "/market/overview"})
    public ResponseEntity<AiMarketOverviewResponse> getMarketOverview() {
        return ResponseEntity.ok(aiService.getMarketOverview());
    }

    @GetMapping({"/stock/{symbol}", "/stock/{symbol}/detail"})
    public ResponseEntity<AiStockDetailResponse> getStockDetail(@PathVariable String symbol) {
        return ResponseEntity.ok(aiService.getStockDetail(symbol));
    }

    @GetMapping({"/latest", "/predictions/latest"})
    public ResponseEntity<List<AiLatestPredictionDto>> getLatestPredictions(
            @RequestParam(defaultValue = "20") Integer limit) {
        return ResponseEntity.ok(aiService.getLatestPredictions(limit));
    }
}
