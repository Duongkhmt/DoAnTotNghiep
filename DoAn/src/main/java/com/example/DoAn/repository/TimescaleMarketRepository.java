package com.example.DoAn.repository;

import com.example.DoAn.dto.response.ForeignTradingDTO;
import com.example.DoAn.dto.response.IndustryFlowDTO;
import com.example.DoAn.dto.response.PeerComparisonDTO;
import com.example.DoAn.dto.response.PredictionResponse;
import com.example.DoAn.dto.response.StockHistoryDTO;
import com.example.DoAn.dto.response.StockResponseDTO;
import com.example.DoAn.dto.response.ValuationDTO;
import com.example.DoAn.dto.response.WyckoffAnalysisDTO;
import com.example.DoAn.dto.response.WyckoffAnalysisDTO;
import org.springframework.jdbc.core.namedparam.MapSqlParameterSource;
import org.springframework.jdbc.core.namedparam.NamedParameterJdbcTemplate;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.sql.Date;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.sql.Timestamp;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

@Repository
public class TimescaleMarketRepository {

    private static final String STOCK_BASE_SQL = """
            SELECT
                l.symbol,
                COALESCE(c.name, l.organ_name) AS company_name,
                COALESCE(c.exchange, l.exchange) AS exchange
            FROM listing l
            LEFT JOIN company c ON c.symbol = l.symbol
            """;

    private final NamedParameterJdbcTemplate jdbcTemplate;

    public TimescaleMarketRepository(NamedParameterJdbcTemplate jdbcTemplate) {
        this.jdbcTemplate = jdbcTemplate;
    }

    public List<StockResponseDTO> findAllStocks() {
        String sql = STOCK_BASE_SQL + """
                LEFT JOIN (
                    SELECT DISTINCT ON (symbol) symbol, volume
                    FROM quote_history
                    ORDER BY symbol, trading_date DESC
                ) q ON q.symbol = l.symbol
                ORDER BY q.volume DESC NULLS LAST, l.symbol ASC
                """;
        return jdbcTemplate.query(
                sql,
                new MapSqlParameterSource(),
                (rs, rowNum) -> mapStock(rs)
        );
    }

    public List<StockResponseDTO> searchStocks(String keyword) {
        String sql = STOCK_BASE_SQL + """
                LEFT JOIN (
                    SELECT DISTINCT ON (symbol) symbol, volume
                    FROM quote_history
                    ORDER BY symbol, trading_date DESC
                ) q ON q.symbol = l.symbol
                WHERE LOWER(l.symbol) LIKE LOWER(:keyword)
                   OR LOWER(COALESCE(c.name, l.organ_name, '')) LIKE LOWER(:keyword)
                ORDER BY q.volume DESC NULLS LAST, l.symbol ASC
                """;
        return jdbcTemplate.query(
                sql,
                new MapSqlParameterSource("keyword", "%" + keyword + "%"),
                (rs, rowNum) -> mapStock(rs)
        );
    }

    public Optional<StockResponseDTO> findStockBySymbol(String symbol) {
        List<StockResponseDTO> results = jdbcTemplate.query(
                STOCK_BASE_SQL + " WHERE l.symbol = :symbol",
                new MapSqlParameterSource("symbol", symbol),
                (rs, rowNum) -> mapStock(rs)
        );
        return results.stream().findFirst();
    }

    public List<StockHistoryDTO> findStockHistory(String symbol, LocalDate startDate, LocalDate endDate, boolean descending) {
        String sql = """
                SELECT
                    q.symbol,
                    q.trading_date,
                    q.open,
                    q.high,
                    q.low,
                    q.close,
                    q.volume,
                    q.turnover,
                    dos.buy_volume AS buy_value,
                    dos.sell_volume AS sell_value,
                    dos.avg_buy_order,
                    dos.avg_sell_order,
                    dos.ratio_sell_buy_order,
                    dos.matched_buy_volume AS matched_buy_value,
                    dos.matched_sell_volume AS matched_sell_value,
                    dos.cancel_buy_volume AS cancel_buy_value,
                    dos.cancel_sell_volume AS cancel_sell_value,
                    t.fr_buy_value,
                    t.fr_sell_value,
                    t.prop_buy_value,
                    t.prop_sell_value,
                    dv.pe AS pe_val,
                    dv.pb AS pb_val
                FROM quote_history q
                LEFT JOIN dashboard_order_stats dos
                    ON UPPER(TRIM(dos.symbol)) = UPPER(TRIM(q.symbol))
                   AND dos.trading_date = q.trading_date
                LEFT JOIN trading t
                    ON UPPER(TRIM(t.symbol)) = UPPER(TRIM(q.symbol))
                   AND t.trading_date = q.trading_date
                LEFT JOIN dashboard_valuation dv
                    ON UPPER(TRIM(dv.symbol)) = UPPER(TRIM(q.symbol))
                   AND dv.trading_date = q.trading_date
                WHERE q.symbol = :symbol
                  AND q.trading_date BETWEEN :startDate AND :endDate
                ORDER BY q.trading_date %s
                """.formatted(descending ? "DESC" : "ASC");

        MapSqlParameterSource params = new MapSqlParameterSource()
                .addValue("symbol", symbol)
                .addValue("startDate", startDate)
                .addValue("endDate", endDate);

        return jdbcTemplate.query(sql, params, (rs, rowNum) -> mapStockHistory(rs));
    }

    public Optional<ValuationDTO> findValuation(String symbol, LocalDate date) {
        String currentSql = """
                SELECT
                    dv.symbol,
                    dv.trading_date,
                    dv.close_price,
                    dv.pe,
                    dv.pb
                FROM dashboard_valuation dv
                WHERE UPPER(TRIM(dv.symbol)) = UPPER(TRIM(:symbol))
                  AND dv.trading_date <= :date
                ORDER BY dv.trading_date DESC
                LIMIT 1
                """;

        List<ValuationDTO> currentRows = jdbcTemplate.query(
                currentSql,
                new MapSqlParameterSource()
                        .addValue("symbol", symbol)
                        .addValue("date", date),
                (rs, rowNum) -> ValuationDTO.builder()
                        .symbol(rs.getString("symbol"))
                        .tradeDate(toLocalDate(rs, "trading_date"))
                        .price(getBigDecimal(rs, "close_price"))
                        .pe(getBigDecimal(rs, "pe"))
                        .pb(getBigDecimal(rs, "pb"))
                        .build()
        );

        if (currentRows.isEmpty()) {
            return Optional.empty();
        }

        ValuationDTO current = currentRows.getFirst();

        Object[] stats = jdbcTemplate.queryForObject(
                """
                        SELECT
                            MIN(pe) AS pe_min,
                            MAX(pe) AS pe_max,
                            AVG(pe) AS pe_avg,
                            MIN(pb) AS pb_min,
                            MAX(pb) AS pb_max,
                            AVG(pb) AS pb_avg
                        FROM dashboard_valuation
                        WHERE symbol = :symbol
                        """,
                new MapSqlParameterSource("symbol", symbol),
                (rs, rowNum) -> new Object[]{
                        getBigDecimal(rs, "pe_min"),
                        getBigDecimal(rs, "pe_max"),
                        scale(getBigDecimal(rs, "pe_avg")),
                        getBigDecimal(rs, "pb_min"),
                        getBigDecimal(rs, "pb_max"),
                        scale(getBigDecimal(rs, "pb_avg"))
                }
        );

        List<PeerComparisonDTO> peers = jdbcTemplate.query(
                """
                        WITH target_industry AS (
                            SELECT COALESCE(c.industry, l.industry) AS industry
                            FROM listing l
                            LEFT JOIN company c ON c.symbol = l.symbol
                            WHERE l.symbol = :symbol
                        )
                        SELECT
                            dv.symbol,
                            dv.pe,
                            dv.pb,
                            dv.close_price
                        FROM dashboard_valuation dv
                        JOIN listing l ON l.symbol = dv.symbol
                        LEFT JOIN company c ON c.symbol = dv.symbol
                        CROSS JOIN target_industry ti
                        WHERE COALESCE(c.industry, l.industry) = ti.industry
                          AND dv.trading_date = :tradeDate
                          AND dv.symbol <> :symbol
                        ORDER BY dv.symbol ASC
                        LIMIT 10
                        """,
                new MapSqlParameterSource()
                        .addValue("symbol", symbol)
                        .addValue("tradeDate", current.getTradeDate()),
                (rs, rowNum) -> PeerComparisonDTO.builder()
                        .symbol(rs.getString("symbol"))
                        .pe(defaultZero(getBigDecimal(rs, "pe")))
                        .pb(defaultZero(getBigDecimal(rs, "pb")))
                        .price(defaultZero(getBigDecimal(rs, "close_price")))
                        .build()
        );

        return Optional.of(
                ValuationDTO.builder()
                        .symbol(current.getSymbol())
                        .tradeDate(current.getTradeDate())
                        .price(defaultZero(current.getPrice()))
                        .pe(defaultZero(current.getPe()))
                        .pb(defaultZero(current.getPb()))
                        .peMin(defaultZero((BigDecimal) stats[0]))
                        .peMax(defaultZero((BigDecimal) stats[1]))
                        .peAvg(defaultZero((BigDecimal) stats[2]))
                        .pbMin(defaultZero((BigDecimal) stats[3]))
                        .pbMax(defaultZero((BigDecimal) stats[4]))
                        .pbAvg(defaultZero((BigDecimal) stats[5]))
                        .peers(peers)
                        .build()
        );
    }

    public List<ForeignTradingDTO> findForeignTrading(String symbol, LocalDate startDate, LocalDate endDate) {
        return jdbcTemplate.query(
                """
                        SELECT
                            q.symbol,
                            q.trading_date,
                            t.fr_buy_value,
                            t.fr_sell_value,
                            t.prop_buy_value,
                            t.prop_sell_value
                        FROM quote_history q
                        LEFT JOIN trading t
                            ON t.symbol = q.symbol
                           AND t.trading_date = q.trading_date
                        WHERE q.symbol = :symbol
                          AND q.trading_date BETWEEN :startDate AND :endDate
                        ORDER BY q.trading_date DESC
                        """,
                new MapSqlParameterSource()
                        .addValue("symbol", symbol)
                        .addValue("startDate", startDate)
                        .addValue("endDate", endDate),
                (rs, rowNum) -> {
                    BigDecimal foreignBuy = defaultZero(getBigDecimal(rs, "fr_buy_value"));
                    BigDecimal foreignSell = defaultZero(getBigDecimal(rs, "fr_sell_value"));
                    BigDecimal propBuy = defaultZero(getBigDecimal(rs, "prop_buy_value"));
                    BigDecimal propSell = defaultZero(getBigDecimal(rs, "prop_sell_value"));

                    return ForeignTradingDTO.builder()
                            .symbol(rs.getString("symbol"))
                            .tradeDate(toLocalDate(rs, "trading_date"))
                            .foreignBuy(foreignBuy)
                            .foreignSell(foreignSell)
                            .foreignNet(foreignBuy.subtract(foreignSell))
                            .tdMua(propBuy)
                            .tdBan(propSell)
                            .tdRong(propBuy.subtract(propSell))
                            .cnMua(null)
                            .cnBan(null)
                            .cnRong(null)
                            .tcMua(null)
                            .tcBan(null)
                            .tcRong(null)
                            .foreignBuyTong(foreignBuy)
                            .foreignSellTong(foreignSell)
                            .foreignNetTong(foreignBuy.subtract(foreignSell))
                            .tdMuaTong(propBuy)
                            .tdBanTong(propSell)
                            .tdRongTong(propBuy.subtract(propSell))
                            .cnMuaTong(null)
                            .cnBanTong(null)
                            .cnRongTong(null)
                            .tcMuaTong(null)
                            .tcBanTong(null)
                            .tcRongTong(null)
                            .build();
                }
        );
    }

    public List<IndustryFlowDTO> findIndustryFlow(LocalDate date) {
        String sql = """
                SELECT *
                FROM dashboard_industry_flow
                WHERE trading_date = (
                    SELECT MAX(trading_date)
                    FROM dashboard_industry_flow
                    WHERE trading_date <= :date
                )
                LIMIT 1
                """;

        List<List<IndustryFlowDTO>> rows = jdbcTemplate.query(
                sql,
                new MapSqlParameterSource("date", date),
                (rs, rowNum) -> buildIndustrySnapshot(rs)
        );

        return rows.isEmpty() ? List.of() : rows.getFirst();
    }

    public List<PredictionResponse> findLatestPredictions(int limit) {
        return jdbcTemplate.query(
                """
                        SELECT
                            p.symbol,
                            p.predict_date,
                            p.target_date,
                            p.predicted_close,
                            q.close AS actual_close,
                            p.trend,
                            p.model_used,
                            p.created_at
                        FROM ml_predictions p
                        LEFT JOIN quote_history q
                               ON q.symbol = p.symbol
                              AND q.trading_date = p.target_date
                        ORDER BY p.created_at DESC
                        LIMIT :limit
                        """,
                new MapSqlParameterSource("limit", limit),
                (rs, rowNum) -> mapPrediction(rs)
        );
    }

    public List<PredictionResponse> findPredictionsBySymbol(String symbol, int limit) {
        return jdbcTemplate.query(
                """
                        SELECT
                            p.symbol,
                            p.predict_date,
                            p.target_date,
                            p.predicted_close,
                            q.close AS actual_close,
                            p.trend,
                            p.model_used,
                            p.created_at
                        FROM ml_predictions p
                        LEFT JOIN quote_history q
                               ON q.symbol = p.symbol
                              AND q.trading_date = p.target_date
                        WHERE p.symbol = :symbol
                        ORDER BY p.created_at DESC
                        LIMIT :limit
                        """,
                new MapSqlParameterSource()
                        .addValue("symbol", symbol)
                        .addValue("limit", limit),
                (rs, rowNum) -> mapPrediction(rs)
        );
    }

    private List<IndustryFlowDTO> buildIndustrySnapshot(ResultSet rs) throws SQLException {
        LocalDate tradeDate = toLocalDate(rs, "trading_date");

        BigDecimal bankTotal = defaultZero(getBigDecimal(rs, "bank_total"));
        BigDecimal bankBuy = defaultZero(getBigDecimal(rs, "bank_buy"));
        BigDecimal bankSell = defaultZero(getBigDecimal(rs, "bank_sell"));

        BigDecimal secTotal = defaultZero(getBigDecimal(rs, "sec_total"));
        BigDecimal secBuy = defaultZero(getBigDecimal(rs, "sec_buy"));
        BigDecimal secSell = defaultZero(getBigDecimal(rs, "sec_sell"));

        BigDecimal reTotal = defaultZero(getBigDecimal(rs, "re_total"));
        BigDecimal reBuy = defaultZero(getBigDecimal(rs, "re_buy"));
        BigDecimal reSell = defaultZero(getBigDecimal(rs, "re_sell"));

        BigDecimal steelTotal = defaultZero(getBigDecimal(rs, "steel_total"));
        BigDecimal steelBuy = defaultZero(getBigDecimal(rs, "steel_buy"));
        BigDecimal steelSell = defaultZero(getBigDecimal(rs, "steel_sell"));

        List<IndustryFlowDTO> result = new ArrayList<>();
        result.add(buildIndustryDto("BANK", "Ngan hang", tradeDate, bankTotal, bankBuy, bankSell, getBigDecimal(rs, "bank_ratio_pct"), rs));
        result.add(buildIndustryDto("SEC", "Chung khoan", tradeDate, secTotal, secBuy, secSell, getBigDecimal(rs, "sec_ratio_pct"), rs));
        result.add(buildIndustryDto("RE", "Bat dong san", tradeDate, reTotal, reBuy, reSell, getBigDecimal(rs, "re_ratio_pct"), rs));
        result.add(buildIndustryDto("STEEL", "Thep", tradeDate, steelTotal, steelBuy, steelSell, getBigDecimal(rs, "steel_ratio_pct"), rs));
        return result;
    }

    private IndustryFlowDTO buildIndustryDto(
            String code,
            String name,
            LocalDate tradeDate,
            BigDecimal totalValue,
            BigDecimal buyValue,
            BigDecimal sellValue,
            BigDecimal marketPercent,
            ResultSet rs
    ) throws SQLException {
        return IndustryFlowDTO.builder()
                .tradeDate(tradeDate)
                .industryCode(code)
                .industryName(name)
                .totalValue(totalValue)
                .buyValue(buyValue)
                .sellValue(sellValue)
                .netValue(buyValue.subtract(sellValue))
                .marketPercent(defaultZero(marketPercent))
                .changePercent(null)
                .totalNH(defaultZero(getBigDecimal(rs, "bank_total")))
                .muaNH(defaultZero(getBigDecimal(rs, "bank_buy")))
                .banNH(defaultZero(getBigDecimal(rs, "bank_sell")))
                .totalCK(defaultZero(getBigDecimal(rs, "sec_total")))
                .muaCK(defaultZero(getBigDecimal(rs, "sec_buy")))
                .banCK(defaultZero(getBigDecimal(rs, "sec_sell")))
                .totalBDS(defaultZero(getBigDecimal(rs, "re_total")))
                .muaBDS(defaultZero(getBigDecimal(rs, "re_buy")))
                .banBDS(defaultZero(getBigDecimal(rs, "re_sell")))
                .totalThep(defaultZero(getBigDecimal(rs, "steel_total")))
                .muaThep(defaultZero(getBigDecimal(rs, "steel_buy")))
                .banThep(defaultZero(getBigDecimal(rs, "steel_sell")))
                .totalVIN(null)
                .muaVIN(null)
                .banVIN(null)
                .tiLeNH(defaultZero(getBigDecimal(rs, "bank_ratio_pct")))
                .tiLeCK(defaultZero(getBigDecimal(rs, "sec_ratio_pct")))
                .tiLeBDS(defaultZero(getBigDecimal(rs, "re_ratio_pct")))
                .tiLeThep(defaultZero(getBigDecimal(rs, "steel_ratio_pct")))
                .tiLeVIN(null)
                .build();
    }

    private StockResponseDTO mapStock(ResultSet rs) throws SQLException {
        return StockResponseDTO.builder()
                .symbol(rs.getString("symbol"))
                .companyName(rs.getString("company_name"))
                .exchange(rs.getString("exchange"))
                .build();
    }

    private PredictionResponse mapPrediction(ResultSet rs) throws SQLException {
        return PredictionResponse.builder()
                .symbol(rs.getString("symbol"))
                .predictDate(toLocalDate(rs, "predict_date"))
                .targetDate(toLocalDate(rs, "target_date"))
                .predictedClose(getBigDecimal(rs, "predicted_close"))
                .actualClose(getBigDecimal(rs, "actual_close"))
                .trend(rs.getString("trend"))
                .modelUsed(rs.getString("model_used"))
                .createdAt(toLocalDateTime(rs, "created_at"))
                .build();
    }

    private StockHistoryDTO mapStockHistory(ResultSet rs) throws SQLException {
        BigDecimal foreignBuyValue = getBigDecimal(rs, "fr_buy_value");
        BigDecimal foreignSellValue = getBigDecimal(rs, "fr_sell_value");
        BigDecimal activeBuyValue = getBigDecimal(rs, "matched_buy_value");
        BigDecimal activeSellValue = getBigDecimal(rs, "matched_sell_value");
        BigDecimal propBuy = getBigDecimal(rs, "prop_buy_value");
        BigDecimal propSell = getBigDecimal(rs, "prop_sell_value");

        return StockHistoryDTO.builder()
                .symbol(rs.getString("symbol"))
                .tradeDate(toLocalDate(rs, "trading_date"))
                .openPrice(getBigDecimal(rs, "open"))
                .highPrice(getBigDecimal(rs, "high"))
                .lowPrice(getBigDecimal(rs, "low"))
                .closePrice(getBigDecimal(rs, "close"))
                .volume(getBigDecimal(rs, "volume"))
                .turnover(getBigDecimal(rs, "turnover"))
                .totalValue(getBigDecimal(rs, "volume"))
                .buyOrderValue(getBigDecimal(rs, "buy_value"))
                .sellOrderValue(getBigDecimal(rs, "sell_value"))
                .avgBuyOrderValue(getBigDecimal(rs, "avg_buy_order"))
                .avgSellOrderValue(getBigDecimal(rs, "avg_sell_order"))
                .orderRatio(getDouble(rs, "ratio_sell_buy_order"))
                .activeBuyValue(activeBuyValue)
                .activeSellValue(activeSellValue)
                .avgMatchedBuy(null)
                .avgMatchedSell(null)
                .matchedRatio(calculateRatio(activeSellValue, activeBuyValue))
                .priceAdjustment1(null)
                .priceAdjustment2(null)
                .priceAdjustment3(null)
                .priceAdjustment4(null)
                .avgAdjustment1(null)
                .avgAdjustment2(null)
                .cancelBuyValue(getBigDecimal(rs, "cancel_buy_value"))
                .cancelSellValue(getBigDecimal(rs, "cancel_sell_value"))
                .avgCancelBuy(null)
                .avgCancelSell(null)
                .foreignBuyVal(foreignBuyValue)
                .foreignSellVal(foreignSellValue)
                .foreignNetVal(calculateNet(foreignBuyValue, foreignSellValue))
                .propBuyVal(propBuy)
                .propSellVal(propSell)
                .propNetVal(calculateNet(propBuy, propSell))
                .individualBuyVal(null)
                .individualSellVal(null)
                .individualNetVal(null)
                .orgBuyVal(null)
                .orgSellVal(null)
                .orgNetVal(null)
                .pe(getBigDecimal(rs, "pe_val"))
                .pb(getBigDecimal(rs, "pb_val"))
                .marketCap(null)
                .closePrice(getBigDecimal(rs, "close"))
                .build();
    }

    private static BigDecimal calculateNet(BigDecimal buy, BigDecimal sell) {
        if (buy == null && sell == null) {
            return null;
        }
        return defaultZero(buy).subtract(defaultZero(sell));
    }

    private static Long calculateNetLong(Long buy, Long sell) {
        if (buy == null && sell == null) {
            return null;
        }
        return defaultZero(buy) - defaultZero(sell);
    }

    private static Double calculateRatio(BigDecimal numerator, BigDecimal denominator) {
        if (numerator == null || denominator == null || denominator.compareTo(BigDecimal.ZERO) == 0) {
            return null;
        }
        return numerator
                .divide(denominator, 4, RoundingMode.HALF_UP)
                .doubleValue();
    }

    private static BigDecimal scale(BigDecimal value) {
        return value == null ? null : value.setScale(2, RoundingMode.HALF_UP);
    }

    private static BigDecimal getBigDecimal(ResultSet rs, String column) throws SQLException {
        return rs.getBigDecimal(column);
    }

    private static Long getLong(ResultSet rs, String column) throws SQLException {
        long value = rs.getLong(column);
        return rs.wasNull() ? null : value;
    }

    private static Double getDouble(ResultSet rs, String column) throws SQLException {
        double value = rs.getDouble(column);
        return rs.wasNull() ? null : value;
    }

    private static LocalDate toLocalDate(ResultSet rs, String column) throws SQLException {
        Date date = rs.getDate(column);
        return date == null ? null : date.toLocalDate();
    }

    private static LocalDateTime toLocalDateTime(ResultSet rs, String column) throws SQLException {
        Timestamp timestamp = rs.getTimestamp(column);
        return timestamp == null ? null : timestamp.toLocalDateTime();
    }

    private static BigDecimal defaultZero(BigDecimal value) {
        return value == null ? BigDecimal.ZERO : value;
    }

    private static Long defaultZero(Long value) {
        return value == null ? 0L : value;
    }

    public Optional<WyckoffAnalysisDTO> findWyckoffAnalysis(String symbol) {
        String sql = """
                SELECT * FROM wyckoff_analysis WHERE symbol = :symbol
                """;
        List<WyckoffAnalysisDTO> results = jdbcTemplate.query(
                sql,
                new MapSqlParameterSource("symbol", symbol),
                (rs, rowNum) -> WyckoffAnalysisDTO.builder()
                        .symbol(rs.getString("symbol"))
                        .phase(rs.getString("phase"))
                        .schematic(rs.getString("schematic"))
                        .trLow(getBigDecimal(rs, "tr_low"))
                        .trHigh(getBigDecimal(rs, "tr_high"))
                        .lastClose(getBigDecimal(rs, "last_close"))
                        .lastDate(toLocalDate(rs, "last_date"))
                        .riskReward(getBigDecimal(rs, "risk_reward"))
                        .dataJson(rs.getString("data_json"))
                        .build()
        );
        return results.stream().findFirst();
    }
}
