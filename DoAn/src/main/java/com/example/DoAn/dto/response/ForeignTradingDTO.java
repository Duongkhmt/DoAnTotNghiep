// ForeignTradingDTO.java (mới)
package com.example.DoAn.dto.response;

import lombok.Builder;
import lombok.Data;
import java.math.BigDecimal;
import java.time.LocalDate;

@Data
@Builder
public class ForeignTradingDTO {
    private String symbol;
    private LocalDate tradeDate;

    // Khối ngoại
    private BigDecimal foreignBuy;
    private BigDecimal foreignSell;
    private BigDecimal foreignNet;

    // TD (Tự doanh)
    private BigDecimal tdMua;
    private BigDecimal tdBan;
    private BigDecimal tdRong;

    // CN (Cá nhân)
    private BigDecimal cnMua;
    private BigDecimal cnBan;
    private BigDecimal cnRong;

    // TC (Tổ chức)
    private BigDecimal tcMua;
    private BigDecimal tcBan;
    private BigDecimal tcRong;
    // --- DỮ LIỆU TỔNG (KHỚP LỆNH + THỎA THUẬN) ---
    private BigDecimal foreignBuyTong;
    private BigDecimal foreignSellTong;
    private BigDecimal foreignNetTong;
    private BigDecimal tdMuaTong;
    private BigDecimal tdBanTong;
    private BigDecimal tdRongTong;
    private BigDecimal cnMuaTong;
    private BigDecimal cnBanTong;
    private BigDecimal cnRongTong;
    private BigDecimal tcMuaTong;
    private BigDecimal tcBanTong;
    private BigDecimal tcRongTong;
}