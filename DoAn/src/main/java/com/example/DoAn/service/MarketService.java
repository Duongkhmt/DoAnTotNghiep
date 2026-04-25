package com.example.DoAn.service;

import com.example.DoAn.dto.response.IndustryFlowDTO;
import com.example.DoAn.dto.response.StockHistoryDTO;
import com.example.DoAn.exception.ApplicationException;
import com.example.DoAn.exception.ErrorCode;
import com.example.DoAn.repository.TimescaleMarketRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.List;

@Service
@RequiredArgsConstructor
public class MarketService {

    private final TimescaleMarketRepository timescaleMarketRepository;

    public List<StockHistoryDTO> getStockHistory(String symbol) {
        return timescaleMarketRepository.findStockHistory(
                symbol.toUpperCase(),
                LocalDate.of(2000, 1, 1),
                LocalDate.now(),
                true
        );
    }

    public List<IndustryFlowDTO> getIndustryFlowByDate(LocalDate date) {
        return timescaleMarketRepository.findIndustryFlow(date);
    }

    public List<StockHistoryDTO> getStockHistoryByDateRange(String symbol, LocalDate startDate, LocalDate endDate) {
        if (startDate == null || endDate == null || startDate.isAfter(endDate)) {
            throw new ApplicationException(ErrorCode.INVALID_KEY);
        }
        return timescaleMarketRepository.findStockHistory(symbol.toUpperCase(), startDate, endDate, true);
    }
}
