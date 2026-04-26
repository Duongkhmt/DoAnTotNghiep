package com.example.DoAn.service;

import com.example.DoAn.dto.response.StockResponseDTO;
import com.example.DoAn.dto.response.WyckoffAnalysisDTO;
import com.example.DoAn.exception.ApplicationException;
import com.example.DoAn.exception.ErrorCode;
import com.example.DoAn.repository.TimescaleMarketRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class StockService {

    private final TimescaleMarketRepository timescaleMarketRepository;

    public List<StockResponseDTO> getAllStocks() {
        return timescaleMarketRepository.findAllStocks();
    }

    public List<StockResponseDTO> searchStocks(String keyword) {
        if (keyword == null || keyword.trim().isEmpty()) {
            return getAllStocks();
        }

        return timescaleMarketRepository.searchStocks(keyword.trim());
    }

    public StockResponseDTO getStockDetailBySymbol(String symbol) {
        return timescaleMarketRepository.findStockBySymbol(symbol.toUpperCase())
                .orElseThrow(() -> new ApplicationException(ErrorCode.STOCK_NOT_FOUND));
    }

    public WyckoffAnalysisDTO getWyckoffAnalysis(String symbol) {
        return timescaleMarketRepository.findWyckoffAnalysis(symbol.toUpperCase())
                .orElse(null);
    }
}
