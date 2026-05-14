package com.example.DoAn.dto.ai;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.annotation.JsonProperty;

import java.math.BigDecimal;

@JsonIgnoreProperties(ignoreUnknown = true)
public record AiMarketBreadthDto(
        @JsonProperty("up_count")
        Integer upCount,
        @JsonProperty("down_count")
        Integer downCount,
        @JsonProperty("neutral_count")
        Integer neutralCount,
        @JsonProperty("up_ratio")
        BigDecimal upRatio,
        @JsonProperty("down_ratio")
        BigDecimal downRatio
) {
}
