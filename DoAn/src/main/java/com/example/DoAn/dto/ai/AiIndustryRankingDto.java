package com.example.DoAn.dto.ai;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.annotation.JsonProperty;

import java.math.BigDecimal;

@JsonIgnoreProperties(ignoreUnknown = true)
public record AiIndustryRankingDto(
        String industry,
        @JsonProperty("avg_ai_score")
        BigDecimal avgAiScore,
        Integer total
) {
}
