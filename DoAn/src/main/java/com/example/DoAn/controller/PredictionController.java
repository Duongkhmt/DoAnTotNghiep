package com.example.DoAn.controller;

import com.example.DoAn.dto.response.PredictionResponse;
import com.example.DoAn.service.PredictionService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/predictions")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class PredictionController {

    private final PredictionService predictionService;

    @GetMapping("/latest")
    public ResponseEntity<List<PredictionResponse>> getLatestPredictions(
            @RequestParam(defaultValue = "20") int limit) {
        return ResponseEntity.ok(predictionService.getLatestPredictions(limit));
    }

    @GetMapping("/{symbol}")
    public ResponseEntity<List<PredictionResponse>> getPredictionsBySymbol(
            @PathVariable String symbol,
            @RequestParam(defaultValue = "20") int limit) {
        return ResponseEntity.ok(predictionService.getPredictionsBySymbol(symbol, limit));
    }
}
