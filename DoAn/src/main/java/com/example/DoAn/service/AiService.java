package com.example.DoAn.service;

import com.example.DoAn.dto.ai.AiLatestPredictionDto;
import com.example.DoAn.dto.ai.AiMarketOverviewResponse;
import com.example.DoAn.dto.ai.AiScreeningHistoryResponse;
import com.example.DoAn.dto.ai.AiScreeningTodayResponse;
import com.example.DoAn.dto.ai.AiStockDetailResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class AiService {

    private final AiClient aiClient;

    public AiScreeningTodayResponse getScreeningToday(String signal, String exchange, String industry) {
        return aiClient.getScreeningToday(signal, exchange, industry);
    }

    public AiStockDetailResponse getStockDetail(String symbol) {
        return aiClient.getStockDetail(symbol);
    }

    public AiScreeningHistoryResponse getScreeningHistory(Integer days) {
        return aiClient.getScreeningHistory(days);
    }

    public AiMarketOverviewResponse getMarketOverview() {
        return aiClient.getMarketOverview();
    }

    public List<AiLatestPredictionDto> getLatestPredictions(Integer limit) {
        return aiClient.getLatestPredictions(limit);
    }
}
