// ValuationDTO.java (mới)
package com.example.DoAn.dto.response;

import lombok.Builder;
import lombok.Data;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

@Data
@Builder
public class ValuationDTO {
    private String symbol;
    private LocalDate tradeDate;
    private BigDecimal price;
    private BigDecimal pe;
    private BigDecimal pb;

    // Thống kê P/E
    private BigDecimal peMin;
    private BigDecimal peMax;
    private BigDecimal peAvg;

    // Thống kê P/B
    private BigDecimal pbMin;
    private BigDecimal pbMax;
    private BigDecimal pbAvg;

    // Danh sách so sánh (DSTK, SHS, DXG, DPM, PVC, CII, PC1, VCI, PVS, PLX)
    private List<PeerComparisonDTO> peers;
}