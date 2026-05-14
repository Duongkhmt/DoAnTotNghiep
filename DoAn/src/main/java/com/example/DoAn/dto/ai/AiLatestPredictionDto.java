package com.example.DoAn.dto.ai;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.annotation.JsonProperty;

import java.math.BigDecimal;

@JsonIgnoreProperties(ignoreUnknown = true)
public record AiLatestPredictionDto(
        String symbol,
        @JsonProperty("predict_date")
        String predictDate,
        @JsonProperty("ai_score")
        BigDecimal aiScore,
        @JsonProperty("ai_signal")
        String aiSignal,
        @JsonProperty("model_name")
        String modelName,
        @JsonProperty("model_version")
        String modelVersion,
        String exchange,
        String industry,
        String sector
) {
}
