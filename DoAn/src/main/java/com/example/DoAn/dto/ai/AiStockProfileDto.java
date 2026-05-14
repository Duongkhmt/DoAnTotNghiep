package com.example.DoAn.dto.ai;

import com.fasterxml.jackson.annotation.JsonAlias;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;

@JsonIgnoreProperties(ignoreUnknown = true)
public record AiStockProfileDto(
        String symbol,
        @JsonAlias({"organ_name", "organName"})
        String organName,
        @JsonAlias({"company_name", "companyName"})
        String companyName,
        String exchange,
        String industry,
        String sector,
        String website,
        String description
) {
}
