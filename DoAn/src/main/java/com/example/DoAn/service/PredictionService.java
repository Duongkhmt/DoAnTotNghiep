package com.example.DoAn.service;

import com.example.DoAn.dto.response.PredictionResponse;
import com.example.DoAn.repository.TimescaleMarketRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class PredictionService {

    private static final int DEFAULT_LIMIT = 20;
    private static final int MAX_LIMIT = 100;

    private final TimescaleMarketRepository timescaleMarketRepository;

    public List<PredictionResponse> getLatestPredictions(int limit) {
        return timescaleMarketRepository.findLatestPredictions(normalizeLimit(limit));
    }

    public List<PredictionResponse> getPredictionsBySymbol(String symbol, int limit) {
        return timescaleMarketRepository.findPredictionsBySymbol(symbol.toUpperCase(), normalizeLimit(limit));
    }

    private int normalizeLimit(int limit) {
        if (limit <= 0) {
            return DEFAULT_LIMIT;
        }
        return Math.min(limit, MAX_LIMIT);
    }
}
