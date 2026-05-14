package com.example.DoAn.dto.ai;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.annotation.JsonProperty;

import java.math.BigDecimal;

@JsonIgnoreProperties(ignoreUnknown = true)
public record AiMoneyFlowPointDto(
        @JsonProperty("trading_date")
        String tradingDate,
        @JsonProperty("fr_buy_value")
        BigDecimal frBuyValue,
        @JsonProperty("fr_sell_value")
        BigDecimal frSellValue,
        @JsonProperty("td_buy_value")
        BigDecimal tdBuyValue,
        @JsonProperty("td_sell_value")
        BigDecimal tdSellValue
) {
}
