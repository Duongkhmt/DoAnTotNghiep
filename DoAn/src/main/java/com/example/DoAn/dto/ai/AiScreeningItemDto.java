package com.example.DoAn.dto.ai;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.annotation.JsonProperty;

import java.math.BigDecimal;

@JsonIgnoreProperties(ignoreUnknown = true)
public record AiScreeningItemDto(
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
        @JsonProperty("rsi_14")
        BigDecimal rsi14,
        BigDecimal macd,
        @JsonProperty("volume_ratio")
        BigDecimal volumeRatio,
        @JsonProperty("price_momentum_5")
        BigDecimal priceMomentum5,
        @JsonProperty("price_momentum_20")
        BigDecimal priceMomentum20,
        @JsonProperty("return_5d")
        BigDecimal return5d,
        @JsonProperty("fr_buy_value")
        BigDecimal frBuyValue,
        @JsonProperty("fr_sell_value")
        BigDecimal frSellValue,
        @JsonProperty("td_buy_value")
        BigDecimal tdBuyValue,
        @JsonProperty("td_sell_value")
        BigDecimal tdSellValue,
        String exchange,
        String industry,
        String sector
) {
}
