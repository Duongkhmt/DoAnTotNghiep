package com.example.DoAn.dto.ai;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.annotation.JsonProperty;

import java.math.BigDecimal;

@JsonIgnoreProperties(ignoreUnknown = true)
public record AiHistoryItemDto(
        String symbol,
        @JsonProperty("predict_date")
        String predictDate,
        @JsonProperty("target_date")
        String targetDate,
        @JsonProperty("ai_score")
        BigDecimal aiScore,
        @JsonProperty("ai_signal")
        String aiSignal,
        @JsonProperty("model_name")
        String modelName,
        @JsonProperty("model_version")
        String modelVersion,
        @JsonProperty("return_5d")
        BigDecimal return5d,
        @JsonProperty("vnindex_return_5d")
        BigDecimal vnindexReturn5d,
        @JsonProperty("alpha_5d")
        BigDecimal alpha5d,
        @JsonProperty("is_top_signal")
        Boolean isTopSignal,
        @JsonProperty("is_correct_relative")
        Boolean isCorrectRelative
) {
}
