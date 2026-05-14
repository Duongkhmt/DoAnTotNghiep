package com.example.DoAn.dto.ai;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.annotation.JsonProperty;

import java.util.List;

@JsonIgnoreProperties(ignoreUnknown = true)
public record AiScreeningTodayResponse(
        @JsonProperty("predict_date")
        String predictDate,
        Integer total,
        @JsonProperty("signal_filter")
        String signalFilter,
        List<AiScreeningItemDto> items
) {
}
