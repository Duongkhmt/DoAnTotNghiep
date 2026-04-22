// IndustryFlowDTO.java (cập nhật)
package com.example.DoAn.dto.response;

import lombok.Builder;
import lombok.Data;
import java.math.BigDecimal;
import java.time.LocalDate;

@Data
@Builder
public class IndustryFlowDTO {
    private LocalDate tradeDate;
    private String industryCode;
    private String industryName;

    // Tổng giá trị
    private BigDecimal totalValue;
    private BigDecimal buyValue;
    private BigDecimal sellValue;
    private BigDecimal netValue; // Thêm giá trị ròng

    // Thống kê theo ngành
    private BigDecimal marketPercent; // Tỉ lệ % so với toàn thị trường
    private BigDecimal changePercent;  // % thay đổi

    // Các chỉ số phụ (cho bảng chi tiết)
    private BigDecimal totalNH;
    private BigDecimal muaNH;
    private BigDecimal banNH;
    private BigDecimal totalCK;
    private BigDecimal muaCK;
    private BigDecimal banCK;
    private BigDecimal totalBDS;
    private BigDecimal muaBDS;
    private BigDecimal banBDS;
    private BigDecimal totalThep;
    private BigDecimal muaThep;
    private BigDecimal banThep;
    private BigDecimal totalVIN;
    private BigDecimal muaVIN;
    private BigDecimal banVIN;

    // Tỉ lệ %
    private BigDecimal tiLeNH;
    private BigDecimal tiLeCK;
    private BigDecimal tiLeBDS;
    private BigDecimal tiLeThep;
    private BigDecimal tiLeVIN;
}