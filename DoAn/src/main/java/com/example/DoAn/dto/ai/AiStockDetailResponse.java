package com.example.DoAn.dto.ai;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.annotation.JsonProperty;

import java.math.BigDecimal;
import java.util.List;

@JsonIgnoreProperties(ignoreUnknown = true)
public record AiStockDetailResponse(
        AiStockProfileDto profile,
        @JsonProperty("latest_price")
        BigDecimal latestPrice,
        @JsonProperty("pct_change")
        BigDecimal pctChange,
        @JsonProperty("price_history")
        List<AiPriceHistoryPointDto> priceHistory,
        @JsonProperty("latest_indicators")
        AiLatestIndicatorsDto latestIndicators,
        @JsonProperty("ai_score_history")
        List<AiScoreHistoryPointDto> aiScoreHistory,
        @JsonProperty("money_flow_30d")
        List<AiMoneyFlowPointDto> moneyFlow30d
) {
}
