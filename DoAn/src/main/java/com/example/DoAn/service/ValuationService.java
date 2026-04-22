package com.example.DoAn.service;

import com.example.DoAn.dto.response.ValuationDTO;
import com.example.DoAn.exception.ApplicationException;
import com.example.DoAn.exception.ErrorCode;
import com.example.DoAn.repository.TimescaleMarketRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDate;

@Service
@RequiredArgsConstructor
public class ValuationService {

    private final TimescaleMarketRepository timescaleMarketRepository;

    public ValuationDTO getValuation(String symbol, LocalDate date) {
        return timescaleMarketRepository.findValuation(symbol, date)
                .orElseThrow(() -> new ApplicationException(ErrorCode.STOCK_NOT_FOUND));
    }
}
