package com.example.DoAn.dto.ai;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.annotation.JsonProperty;

import java.math.BigDecimal;

@JsonIgnoreProperties(ignoreUnknown = true)
public record AiSignalDistributionDto(
        @JsonProperty("ai_signal")
        String aiSignal,
        Integer total,
        @JsonProperty("avg_ai_score")
        BigDecimal avgAiScore
) {
}
