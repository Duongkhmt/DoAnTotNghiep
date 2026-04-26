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

    // Giá trị khớp
    private BigDecimal totalValue; // Đây là khối lượng khớp (shares)
    private BigDecimal openPrice;
    private BigDecimal highPrice;
    private BigDecimal lowPrice;
    private BigDecimal closePrice;
    private BigDecimal volume; // shares
    private BigDecimal turnover; // value

    // Đặt lệnh
    private BigDecimal buyOrderValue;
    private BigDecimal sellOrderValue;
    private BigDecimal avgBuyOrderValue;
    private BigDecimal avgSellOrderValue;
    private Double orderRatio;

    // Khớp lệnh chủ động
    private BigDecimal activeBuyValue;
    private BigDecimal activeSellValue;
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
    private BigDecimal cancelBuyValue;
    private BigDecimal cancelSellValue;
    private BigDecimal avgCancelBuy;
    private BigDecimal avgCancelSell;

    // Khối ngoại
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
}