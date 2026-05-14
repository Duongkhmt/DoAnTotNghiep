package com.example.DoAn.dto.ai;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.annotation.JsonProperty;

import java.math.BigDecimal;

@JsonIgnoreProperties(ignoreUnknown = true)
public record AiDailyWinRateDto(
        @JsonProperty("predict_date")
        String predictDate,
        @JsonProperty("win_rate")
        BigDecimal winRate,
        @JsonProperty("relative_win_rate")
        BigDecimal relativeWinRate,
        @JsonProperty("total_predictions")
        Integer totalPredictions,
        @JsonProperty("correct_predictions")
        Integer correctPredictions
) {
}
