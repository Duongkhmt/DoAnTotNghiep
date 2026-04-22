package com.example.DoAn.controller;

import com.example.DoAn.dto.response.IndustryFlowDTO;
import com.example.DoAn.dto.response.StockHistoryDTO;
import com.example.DoAn.service.MarketService;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/api/market")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class MarketController {

    private final MarketService marketService;

    @GetMapping("/history/{symbol}")
    public ResponseEntity<List<StockHistoryDTO>> getStockHistory(@PathVariable String symbol) {
        return ResponseEntity.ok(marketService.getStockHistory(symbol));
    }

    @GetMapping("/history/{symbol}/range")
    public ResponseEntity<List<StockHistoryDTO>> getStockHistoryByDateRange(
            @PathVariable String symbol,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate) {
        return ResponseEntity.ok(marketService.getStockHistoryByDateRange(symbol, startDate, endDate));
    }

    @GetMapping("/industry-flow")
    public ResponseEntity<List<IndustryFlowDTO>> getIndustryFlow(
            @RequestParam(required = false)
            @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date) {
        LocalDate effectiveDate = date != null ? date : LocalDate.now();
        return ResponseEntity.ok(marketService.getIndustryFlowByDate(effectiveDate));
    }
}
