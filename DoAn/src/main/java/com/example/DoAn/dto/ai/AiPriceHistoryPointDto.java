package com.example.DoAn.dto.ai;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.annotation.JsonProperty;

import java.math.BigDecimal;

@JsonIgnoreProperties(ignoreUnknown = true)
public record AiPriceHistoryPointDto(
        @JsonProperty("trading_date")
        String tradingDate,
        BigDecimal open,
        BigDecimal high,
        BigDecimal low,
        BigDecimal close,
        BigDecimal volume,
        @JsonProperty("sma_20")
        BigDecimal sma20,
        @JsonProperty("sma_50")
        BigDecimal sma50
) {
}
