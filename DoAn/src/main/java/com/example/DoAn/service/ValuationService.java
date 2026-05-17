package com.example.DoAn.service;

import com.example.DoAn.dto.response.PeerComparisonDTO;
import com.example.DoAn.dto.response.ValuationDTO;
import com.example.DoAn.exception.ApplicationException;
import com.example.DoAn.exception.ErrorCode;
import com.example.DoAn.repository.TimescaleMarketRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.List;

@Service
@RequiredArgsConstructor
public class ValuationService {

    private final TimescaleMarketRepository timescaleMarketRepository;

    public ValuationDTO getValuation(String symbol, LocalDate date) {
        ValuationDTO valuation = timescaleMarketRepository.findValuationBasic(symbol, date)
                .orElseThrow(() -> new ApplicationException(ErrorCode.STOCK_NOT_FOUND));

        List<PeerComparisonDTO> peers = timescaleMarketRepository.findPeers(symbol, valuation.getTradeDate());
        
        return valuation.toBuilder()
                .peers(peers)
                .build();
    }
}
