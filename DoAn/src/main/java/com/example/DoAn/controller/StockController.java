package com.example.DoAn.controller;

import com.example.DoAn.dto.response.StockResponseDTO;
import com.example.DoAn.dto.response.WyckoffAnalysisDTO;
import com.example.DoAn.service.StockService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/stocks")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class StockController {

    private final StockService stockService;

    // API 1: Lấy tất cả (GET /api/stocks)
    @GetMapping
    public ResponseEntity<List<StockResponseDTO>> getAllStocks() {
        return ResponseEntity.ok(stockService.getAllStocks());
    }

    // API 2: Tìm kiếm (GET /api/stocks/search?keyword=FPT)
    @GetMapping("/search")
    public ResponseEntity<List<StockResponseDTO>> searchStocks(@RequestParam String keyword) {
        return ResponseEntity.ok(stockService.searchStocks(keyword));
    }

    // API 3: Lấy chi tiết 1 mã cụ thể (GET /api/stocks/FPT)
    @GetMapping("/{symbol}")
    public ResponseEntity<StockResponseDTO> getStockDetail(@PathVariable String symbol) {
        return ResponseEntity.ok(stockService.getStockDetailBySymbol(symbol));
    }

    @GetMapping("/{symbol}/wyckoff")
    public ResponseEntity<WyckoffAnalysisDTO> getWyckoffAnalysis(@PathVariable String symbol) {
        return ResponseEntity.ok(stockService.getWyckoffAnalysis(symbol));
    }
}