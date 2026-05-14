package com.example.DoAn.dto.ai;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.annotation.JsonProperty;

import java.util.List;

@JsonIgnoreProperties(ignoreUnknown = true)
public record AiMarketOverviewResponse(
        @JsonProperty("predict_date")
        String predictDate,
        @JsonProperty("market_breadth")
        AiMarketBreadthDto marketBreadth,
        @JsonProperty("signal_distribution")
        List<AiSignalDistributionDto> signalDistribution,
        @JsonProperty("top_industries")
        List<AiIndustryRankingDto> topIndustries,
        @JsonProperty("bottom_industries")
        List<AiIndustryRankingDto> bottomIndustries
) {
}
