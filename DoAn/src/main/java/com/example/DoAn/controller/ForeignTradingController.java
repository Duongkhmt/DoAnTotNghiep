// ForeignTradingController.java (mới)
package com.example.DoAn.controller;

import com.example.DoAn.dto.response.ForeignTradingDTO;
import com.example.DoAn.service.ForeignTradingService;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/api/foreign-trading")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class ForeignTradingController {

    private final ForeignTradingService foreignTradingService;

    @GetMapping("/{symbol}")
    public ResponseEntity<List<ForeignTradingDTO>> getForeignTrading(
            @PathVariable String symbol,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate) {
        return ResponseEntity.ok(foreignTradingService.getForeignTrading(
                symbol.toUpperCase(), startDate, endDate));
    }
}