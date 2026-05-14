package com.example.DoAn.dto.ai;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.annotation.JsonProperty;

import java.util.List;

@JsonIgnoreProperties(ignoreUnknown = true)
public record AiScreeningHistoryResponse(
        List<AiHistoryItemDto> items,
        @JsonProperty("daily_win_rate")
        List<AiDailyWinRateDto> dailyWinRate
) {
}
