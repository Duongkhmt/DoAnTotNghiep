package com.example.DoAn.controller;

import com.example.DoAn.service.AiService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;

@RestController
@RequestMapping("/api/ai")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class AiController {

    private final AiService aiService;

    @PostMapping("/trigger-prediction")
    public ResponseEntity<Map<String, Object>> triggerPrediction() {
        return ResponseEntity.ok(aiService.triggerDailyPrediction());
    }

    @PostMapping("/predict-now")
    public ResponseEntity<Map<String, Object>> predictNow(@RequestBody(required = false) String[] symbols) {
        if (symbols == null || symbols.length == 0) {
            return ResponseEntity.ok(aiService.triggerDailyPrediction());
        }
        return ResponseEntity.ok(aiService.predictNow(symbols));
    }
}
