package com.example.DoAn.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PredictionResponse {
    private String symbol;
    private LocalDate predictDate;
    private LocalDate targetDate;
    private BigDecimal predictedClose;
    private BigDecimal actualClose;
    private String trend;
    private String modelUsed;
    private LocalDateTime createdAt;
}
