package com.example.DoAn.controller;

import com.example.DoAn.dto.response.ValuationDTO;
import com.example.DoAn.service.ValuationService;
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

@RestController
@RequestMapping("/api/valuation")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class ValuationController {

    private final ValuationService valuationService;

    @GetMapping("/{symbol}")
    public ResponseEntity<ValuationDTO> getValuation(
            @PathVariable String symbol,
            @RequestParam(required = false)
            @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date) {
        LocalDate effectiveDate = date != null ? date : LocalDate.now();
        return ResponseEntity.ok(valuationService.getValuation(symbol.toUpperCase(), effectiveDate));
    }
}
