package com.example.DoAn.dto.ai;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.annotation.JsonProperty;

import java.math.BigDecimal;

@JsonIgnoreProperties(ignoreUnknown = true)
public record AiScoreHistoryPointDto(
        @JsonProperty("predict_date")
        String predictDate,
        @JsonProperty("ai_score")
        BigDecimal aiScore,
        @JsonProperty("ai_signal")
        String aiSignal
) {
}
