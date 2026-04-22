// PeerComparisonDTO.java (mới)
package com.example.DoAn.dto.response;

import lombok.Builder;
import lombok.Data;
import java.math.BigDecimal;

@Data
@Builder
public class PeerComparisonDTO {
    private String symbol;
    private BigDecimal pe;
    private BigDecimal pb;
    private BigDecimal price;
}