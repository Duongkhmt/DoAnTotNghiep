package com.example.DoAn.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class StockResponseDTO {
    private String symbol;       // Mã cổ phiếu (VD: FPT)
    private String companyName;  // Tên công ty
    private String exchange;     // Sàn giao dịch (HOSE, HNX, UPCOM)
}