package com.example.DoAn.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDate;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class WyckoffAnalysisDTO {
    private String symbol;
    private String phase;
    private String schematic;
    private BigDecimal trLow;
    private BigDecimal trHigh;
    private BigDecimal lastClose;
    private LocalDate lastDate;
    private BigDecimal riskReward;
    private String dataJson;
}
