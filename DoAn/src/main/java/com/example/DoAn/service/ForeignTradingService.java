package com.example.DoAn.service;

import com.example.DoAn.dto.response.ForeignTradingDTO;
import com.example.DoAn.exception.ApplicationException;
import com.example.DoAn.exception.ErrorCode;
import com.example.DoAn.repository.TimescaleMarketRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.List;

@Service
@RequiredArgsConstructor
public class ForeignTradingService {

    private final TimescaleMarketRepository timescaleMarketRepository;

    public List<ForeignTradingDTO> getForeignTrading(String symbol, LocalDate startDate, LocalDate endDate) {
        if (startDate == null || endDate == null || startDate.isAfter(endDate)) {
            throw new ApplicationException(ErrorCode.INVALID_KEY);
        }
        return timescaleMarketRepository.findForeignTrading(symbol, startDate, endDate);
    }
}
