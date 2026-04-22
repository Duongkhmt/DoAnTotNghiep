package com.example.DoAn.dto.response;

import lombok.Builder;
import lombok.Data;
import java.math.BigDecimal;
import java.time.LocalDate;

@Data
@Builder
public class StockHistoryDTO {
    private String symbol;
    private LocalDate tradeDate;

    // Khối lượng khớp
    private Long totalVolume;

    // Đặt lệnh
    private Long buyOrderVolume;
    private Long sellOrderVolume;
    private BigDecimal avgBuyOrderVolume;
    private BigDecimal avgSellOrderVolume;
    private Double orderRatio;

    // Khớp lệnh chủ động
    private Long activeBuyVolume;
    private Long activeSellVolume;
    private BigDecimal avgMatchedBuy;
    private BigDecimal avgMatchedSell;
    private Double matchedRatio;

    // Điều chỉnh giá
    private Long priceAdjustment1;
    private Long priceAdjustment2;
    private Long priceAdjustment3;
    private Long priceAdjustment4;
    private BigDecimal avgAdjustment1;
    private BigDecimal avgAdjustment2;

    // Hủy lệnh
    private Long cancelBuyVolume;
    private Long cancelSellVolume;
    private BigDecimal avgCancelBuy;   // <-- Thêm dòng này
    private BigDecimal avgCancelSell;  // <-- Thêm dòng này

    // Khối ngoại
    private Long foreignBuyVolume;
    private Long foreignSellVolume;
    private Long foreignNetVolume;
    private BigDecimal foreignBuyVal;
    private BigDecimal foreignSellVal;
    private BigDecimal foreignNetVal;

    // Tự doanh
    private BigDecimal propBuyVal;
    private BigDecimal propSellVal;
    private BigDecimal propNetVal;

    // Cá nhân
    private BigDecimal individualBuyVal;
    private BigDecimal individualSellVal;
    private BigDecimal individualNetVal;

    // Tổ chức
    private BigDecimal orgBuyVal;
    private BigDecimal orgSellVal;
    private BigDecimal orgNetVal;

    // Định giá
    private BigDecimal pe;
    private BigDecimal pb;
    private BigDecimal marketCap;
    private BigDecimal closePrice;
}