package com.example.DoAn.dto.ai;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.annotation.JsonProperty;

import java.math.BigDecimal;

@JsonIgnoreProperties(ignoreUnknown = true)
public record AiLatestIndicatorsDto(
        @JsonProperty("rsi_14")
        BigDecimal rsi14,
        BigDecimal macd,
        @JsonProperty("volume_ratio")
        BigDecimal volumeRatio,
        @JsonProperty("price_momentum_5")
        BigDecimal priceMomentum5,
        @JsonProperty("price_momentum_20")
        BigDecimal priceMomentum20
) {
}
