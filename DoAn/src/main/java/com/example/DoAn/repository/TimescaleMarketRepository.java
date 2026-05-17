package com.example.DoAn.repository;

import com.example.DoAn.dto.response.ForeignTradingDTO;
import com.example.DoAn.dto.response.IndustryFlowDTO;
import com.example.DoAn.dto.response.PeerComparisonDTO;
import com.example.DoAn.dto.response.PredictionResponse;
import com.example.DoAn.dto.response.StockHistoryDTO;
import com.example.DoAn.dto.response.StockResponseDTO;
import com.example.DoAn.dto.response.ValuationDTO;
import com.example.DoAn.dto.response.WyckoffAnalysisDTO;

import org.springframework.jdbc.core.RowMapper;
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

    private static final String FIND_ALL_STOCKS_SQL = STOCK_BASE_SQL + """
            LEFT JOIN LATERAL (
                SELECT volume
                FROM quote_history
                WHERE symbol = l.symbol
                ORDER BY trading_date DESC
                LIMIT 1
            ) q ON true
            ORDER BY q.volume DESC NULLS LAST, l.symbol ASC
            """;

    private static final String SEARCH_STOCKS_SQL = STOCK_BASE_SQL + """
            LEFT JOIN LATERAL (
                SELECT volume
                FROM quote_history
                WHERE symbol = l.symbol
                ORDER BY trading_date DESC
                LIMIT 1
            ) q ON true
            WHERE LOWER(l.symbol) LIKE LOWER(:keyword)
               OR LOWER(COALESCE(c.name, l.organ_name, '')) LIKE LOWER(:keyword)
            ORDER BY q.volume DESC NULLS LAST, l.symbol ASC
            """;

    private static final String FIND_STOCK_HISTORY_BASE_SQL = """
            WITH q AS MATERIALIZED (
                SELECT *
                FROM quote_history
                WHERE symbol = :symbol
                  AND trading_date BETWEEN :startDate AND :endDate
            )
            SELECT
                q.symbol, q.trading_date, q.open, q.high, q.low, q.close, q.volume, q.turnover,
                dos.buy_volume AS buy_value, dos.sell_volume AS sell_value,
                dos.avg_buy_order, dos.avg_sell_order, dos.ratio_sell_buy_order,
                dos.matched_buy_volume AS matched_buy_value, dos.matched_sell_volume AS matched_sell_value,
                dos.cancel_buy_volume AS cancel_buy_value, dos.cancel_sell_volume AS cancel_sell_value,
                dos.foreign_buy_volume, dos.foreign_sell_volume,
                t.fr_buy_value, t.fr_sell_value, t.prop_buy_value, t.prop_sell_value,
                dv.pe AS pe_val, dv.pb AS pb_val
            FROM q
            LEFT JOIN dashboard_order_stats dos ON dos.symbol = q.symbol AND dos.trading_date = q.trading_date
            LEFT JOIN trading t ON t.symbol = q.symbol AND t.trading_date = q.trading_date
            LEFT JOIN dashboard_valuation dv ON dv.symbol = q.symbol AND dv.trading_date = q.trading_date
            """;

    private static final String FIND_VALUATION_BASIC_SQL = """
            WITH latest AS (
                SELECT symbol, trading_date, close_price, pe, pb
                FROM dashboard_valuation
                WHERE symbol = :symbol
                  AND trading_date <= :date
                ORDER BY trading_date DESC
                LIMIT 1
            ),
            stats AS (
                SELECT
                    MIN(pe) AS pe_min, MAX(pe) AS pe_max, AVG(pe) AS pe_avg,
                    MIN(pb) AS pb_min, MAX(pb) AS pb_max, AVG(pb) AS pb_avg
                FROM dashboard_valuation
                WHERE symbol = :symbol
            )
            SELECT
                l.symbol, l.trading_date, l.close_price, l.pe, l.pb,
                s.pe_min, s.pe_max, s.pe_avg, s.pb_min, s.pb_max, s.pb_avg
            FROM latest l
            CROSS JOIN stats s
            """;

    private static final String FIND_PEERS_SQL = """
            WITH target_industry AS (
                SELECT COALESCE(c.industry, l.industry) AS industry
                FROM listing l
                LEFT JOIN company c ON c.symbol = l.symbol
                WHERE l.symbol = :symbol
            )
            SELECT dv.symbol, dv.pe, dv.pb, dv.close_price
            FROM dashboard_valuation dv
            JOIN listing l ON l.symbol = dv.symbol
            LEFT JOIN company c ON c.symbol = dv.symbol
            CROSS JOIN target_industry ti
            WHERE COALESCE(c.industry, l.industry) = ti.industry
              AND dv.trading_date = :tradeDate
              AND dv.symbol <> :symbol
            ORDER BY dv.symbol ASC
            LIMIT 10
            """;

    private static final String FIND_FOREIGN_TRADING_SQL = """
            SELECT
                q.symbol, q.trading_date,
                t.fr_buy_value, t.fr_sell_value, t.prop_buy_value, t.prop_sell_value
            FROM quote_history q
            LEFT JOIN trading t ON t.symbol = q.symbol AND t.trading_date = q.trading_date
            WHERE q.symbol = :symbol
              AND q.trading_date BETWEEN :startDate AND :endDate
            ORDER BY q.trading_date DESC
            """;

    private static final String FIND_INDUSTRY_FLOW_SNAPSHOT_SQL = """
            SELECT * FROM dashboard_industry_flow
            WHERE trading_date = (
                SELECT MAX(trading_date) FROM dashboard_industry_flow WHERE trading_date <= :date
            )
            """;

    private static final String PREDICTION_BASE_SQL = """
            SELECT
                p.symbol, p.predict_date, p.target_date, p.predicted_close,
                q.close AS actual_close, p.trend, p.model_used, p.created_at
            FROM ml_predictions p
            LEFT JOIN quote_history q ON q.symbol = p.symbol AND q.trading_date = p.target_date
            """;

    private final NamedParameterJdbcTemplate jdbcTemplate;

    public TimescaleMarketRepository(NamedParameterJdbcTemplate jdbcTemplate) {
        this.jdbcTemplate = jdbcTemplate;
    }

    public List<StockResponseDTO> findAllStocks() {
        return jdbcTemplate.query(FIND_ALL_STOCKS_SQL, new MapSqlParameterSource(), new StockRowMapper());
    }

    public List<StockResponseDTO> searchStocks(String keyword) {
        return jdbcTemplate.query(SEARCH_STOCKS_SQL,
                new MapSqlParameterSource("keyword", "%" + keyword + "%"),
                new StockRowMapper());
    }

    public Optional<StockResponseDTO> findStockBySymbol(String symbol) {
        String sql = STOCK_BASE_SQL + " WHERE l.symbol = :symbol";
        List<StockResponseDTO> results = jdbcTemplate.query(sql,
                new MapSqlParameterSource("symbol", normalize(symbol)),
                new StockRowMapper());
        return results.stream().findFirst();
    }

    public List<StockHistoryDTO> findStockHistory(String symbol, LocalDate startDate, LocalDate endDate, boolean descending) {
        String sql = FIND_STOCK_HISTORY_BASE_SQL + " ORDER BY q.trading_date " + (descending ? "DESC" : "ASC");
        MapSqlParameterSource params = new MapSqlParameterSource()
                .addValue("symbol", normalize(symbol))
                .addValue("startDate", startDate)
                .addValue("endDate", endDate);

        return jdbcTemplate.query(sql, params, new StockHistoryRowMapper());
    }

    public Optional<ValuationDTO> findValuationBasic(String symbol, LocalDate date) {
        List<ValuationDTO> rows = jdbcTemplate.query(FIND_VALUATION_BASIC_SQL,
                new MapSqlParameterSource()
                        .addValue("symbol", normalize(symbol))
                        .addValue("date", date),
                new ValuationRowMapper());

        return rows.stream().findFirst();
    }

    public List<PeerComparisonDTO> findPeers(String symbol, LocalDate tradeDate) {
        return jdbcTemplate.query(FIND_PEERS_SQL,
                new MapSqlParameterSource()
                        .addValue("symbol", normalize(symbol))
                        .addValue("tradeDate", tradeDate),
                new PeerComparisonRowMapper());
    }

    public List<ForeignTradingDTO> findForeignTrading(String symbol, LocalDate startDate, LocalDate endDate) {
        return jdbcTemplate.query(FIND_FOREIGN_TRADING_SQL,
                new MapSqlParameterSource()
                        .addValue("symbol", normalize(symbol))
                        .addValue("startDate", startDate)
                        .addValue("endDate", endDate),
                new ForeignTradingRowMapper());
    }

    public List<IndustryFlowDTO> findIndustryFlow(LocalDate date) {
        return jdbcTemplate.query(FIND_INDUSTRY_FLOW_SNAPSHOT_SQL,
                new MapSqlParameterSource("date", date),
                new IndustryFlowRowMapper());
    }

    public List<IndustryFlowDTO> findIndustryFlowHistory(LocalDate date, int limit, int offset) {
        MapSqlParameterSource params = new MapSqlParameterSource()
                .addValue("limit", limit)
                .addValue("offset", offset);

        StringBuilder sql = new StringBuilder("SELECT * FROM dashboard_industry_flow ");
        if (date != null) {
            sql.append("WHERE trading_date <= CAST(:date AS DATE) ");
            params.addValue("date", Date.valueOf(date));
        }
        sql.append("ORDER BY trading_date DESC LIMIT :limit OFFSET :offset");

        return jdbcTemplate.query(sql.toString(), params, new IndustryFlowRowMapper());
    }

    public List<PredictionResponse> findLatestPredictions(int limit) {
        String sql = PREDICTION_BASE_SQL + " ORDER BY p.created_at DESC LIMIT :limit";
        return jdbcTemplate.query(sql, new MapSqlParameterSource("limit", limit), new PredictionRowMapper());
    }

    public List<PredictionResponse> findPredictionsBySymbol(String symbol, int limit) {
        String sql = PREDICTION_BASE_SQL + " WHERE p.symbol = :symbol ORDER BY p.created_at DESC LIMIT :limit";
        return jdbcTemplate.query(sql,
                new MapSqlParameterSource()
                        .addValue("symbol", normalize(symbol))
                        .addValue("limit", limit),
                new PredictionRowMapper());
    }

    public Optional<WyckoffAnalysisDTO> findWyckoffAnalysis(String symbol) {
        String sql = "SELECT * FROM wyckoff_analysis WHERE symbol = :symbol";
        List<WyckoffAnalysisDTO> results = jdbcTemplate.query(sql,
                new MapSqlParameterSource("symbol", normalize(symbol)),
                new WyckoffRowMapper());
        return results.stream().findFirst();
    }

    private static class StockRowMapper implements RowMapper<StockResponseDTO> {
        @Override
        public StockResponseDTO mapRow(ResultSet rs, int rowNum) throws SQLException {
            return StockResponseDTO.builder()
                    .symbol(rs.getString("symbol"))
                    .companyName(rs.getString("company_name"))
                    .exchange(rs.getString("exchange"))
                    .build();
        }
    }

    private static class StockHistoryRowMapper implements RowMapper<StockHistoryDTO> {
        @Override
        public StockHistoryDTO mapRow(ResultSet rs, int rowNum) throws SQLException {
            BigDecimal foreignBuyVol  = rs.getBigDecimal("foreign_buy_volume");
            BigDecimal foreignSellVol = rs.getBigDecimal("foreign_sell_volume");
            BigDecimal activeBuyValue  = rs.getBigDecimal("matched_buy_value");
            BigDecimal activeSellValue = rs.getBigDecimal("matched_sell_value");
            BigDecimal propBuy        = rs.getBigDecimal("prop_buy_value");
            BigDecimal propSell       = rs.getBigDecimal("prop_sell_value");
            BigDecimal close = rs.getBigDecimal("close");

            return StockHistoryDTO.builder()
                    .symbol(rs.getString("symbol"))
                    .tradeDate(toLocalDate(rs, "trading_date"))
                    .openPrice(rs.getBigDecimal("open"))
                    .highPrice(rs.getBigDecimal("high"))
                    .lowPrice(rs.getBigDecimal("low"))
                    .closePrice(close)
                    .volume(rs.getBigDecimal("volume"))
                    .turnover(rs.getBigDecimal("turnover"))
                    .totalValue(rs.getBigDecimal("volume"))
                    .buyOrderValue(rs.getBigDecimal("buy_value"))
                    .sellOrderValue(rs.getBigDecimal("sell_value"))
                    .avgBuyOrderVolume(rs.getBigDecimal("avg_buy_order"))
                    .avgSellOrderVolume(rs.getBigDecimal("avg_sell_order"))
                    .orderRatio(getDouble(rs, "ratio_sell_buy_order"))
                    .activeBuyValue(activeBuyValue)
                    .activeSellValue(activeSellValue)
                    .matchedRatio(calculateRatio(activeSellValue, activeBuyValue))
                    .cancelBuyValue(rs.getBigDecimal("cancel_buy_value"))
                    .cancelSellValue(rs.getBigDecimal("cancel_sell_value"))
                    .foreignBuyVol(foreignBuyVol)
                    .foreignSellVol(foreignSellVol)
                    .foreignNetVol(calculateNet(foreignBuyVol, foreignSellVol))
                    .propBuyVal(propBuy)
                    .propSellVal(propSell)
                    .propNetVal(calculateNet(propBuy, propSell))
                    .pe(rs.getBigDecimal("pe_val"))
                    .pb(rs.getBigDecimal("pb_val"))
                    .build();
        }
    }

    private static class ValuationRowMapper implements RowMapper<ValuationDTO> {
        @Override
        public ValuationDTO mapRow(ResultSet rs, int rowNum) throws SQLException {
            return ValuationDTO.builder()
                    .symbol(rs.getString("symbol"))
                    .tradeDate(toLocalDate(rs, "trading_date"))
                    .price(defaultZero(rs.getBigDecimal("close_price")))
                    .pe(defaultZero(rs.getBigDecimal("pe")))
                    .pb(defaultZero(rs.getBigDecimal("pb")))
                    .peMin(defaultZero(rs.getBigDecimal("pe_min")))
                    .peMax(defaultZero(rs.getBigDecimal("pe_max")))
                    .peAvg(defaultZero(scale(rs.getBigDecimal("pe_avg"))))
                    .pbMin(defaultZero(rs.getBigDecimal("pb_min")))
                    .pbMax(defaultZero(rs.getBigDecimal("pb_max")))
                    .pbAvg(defaultZero(scale(rs.getBigDecimal("pb_avg"))))
                    .build();
        }
    }

    private static class PeerComparisonRowMapper implements RowMapper<PeerComparisonDTO> {
        @Override
        public PeerComparisonDTO mapRow(ResultSet rs, int rowNum) throws SQLException {
            return PeerComparisonDTO.builder()
                    .symbol(rs.getString("symbol"))
                    .pe(defaultZero(rs.getBigDecimal("pe")))
                    .pb(defaultZero(rs.getBigDecimal("pb")))
                    .price(defaultZero(rs.getBigDecimal("close_price")))
                    .build();
        }
    }

    private static class ForeignTradingRowMapper implements RowMapper<ForeignTradingDTO> {
        @Override
        public ForeignTradingDTO mapRow(ResultSet rs, int rowNum) throws SQLException {
            BigDecimal foreignBuy = defaultZero(rs.getBigDecimal("fr_buy_value"));
            BigDecimal foreignSell = defaultZero(rs.getBigDecimal("fr_sell_value"));
            BigDecimal propBuy = defaultZero(rs.getBigDecimal("prop_buy_value"));
            BigDecimal propSell = defaultZero(rs.getBigDecimal("prop_sell_value"));

            return ForeignTradingDTO.builder()
                    .symbol(rs.getString("symbol"))
                    .tradeDate(toLocalDate(rs, "trading_date"))
                    .foreignBuy(foreignBuy)
                    .foreignSell(foreignSell)
                    .foreignNet(foreignBuy.subtract(foreignSell))
                    .tdMua(propBuy)
                    .tdBan(propSell)
                    .tdRong(propBuy.subtract(propSell))
                    .foreignBuyTong(foreignBuy)
                    .foreignSellTong(foreignSell)
                    .foreignNetTong(foreignBuy.subtract(foreignSell))
                    .tdMuaTong(propBuy)
                    .tdBanTong(propSell)
                    .tdRongTong(propBuy.subtract(propSell))
                    .build();
        }
    }

    private static class IndustryFlowRowMapper implements RowMapper<IndustryFlowDTO> {
        @Override
        public IndustryFlowDTO mapRow(ResultSet rs, int rowNum) throws SQLException {
            return IndustryFlowDTO.builder()
                    .tradeDate(toLocalDate(rs, "trading_date"))
                    .totalValue(defaultZero(rs.getBigDecimal("market_total_val")))
                    .totalNH(defaultZero(rs.getBigDecimal("bank_total")))
                    .muaNH(defaultZero(rs.getBigDecimal("bank_buy")))
                    .banNH(defaultZero(rs.getBigDecimal("bank_sell")))
                    .tiLeNH(defaultZero(rs.getBigDecimal("bank_ratio_pct")))
                    .totalCK(defaultZero(rs.getBigDecimal("sec_total")))
                    .muaCK(defaultZero(rs.getBigDecimal("sec_buy")))
                    .banCK(defaultZero(rs.getBigDecimal("sec_sell")))
                    .tiLeCK(defaultZero(rs.getBigDecimal("sec_ratio_pct")))
                    .totalBDS(defaultZero(rs.getBigDecimal("re_total")))
                    .muaBDS(defaultZero(rs.getBigDecimal("re_buy")))
                    .banBDS(defaultZero(rs.getBigDecimal("re_sell")))
                    .tiLeBDS(defaultZero(rs.getBigDecimal("re_ratio_pct")))
                    .totalThep(defaultZero(rs.getBigDecimal("steel_total")))
                    .muaThep(defaultZero(rs.getBigDecimal("steel_buy")))
                    .banThep(defaultZero(rs.getBigDecimal("steel_sell")))
                    .tiLeThep(defaultZero(rs.getBigDecimal("steel_ratio_pct")))
                    .totalVIN(defaultZero(rs.getBigDecimal("vin_total")))
                    .muaVIN(defaultZero(rs.getBigDecimal("vin_buy")))
                    .banVIN(defaultZero(rs.getBigDecimal("vin_sell")))
                    .tiLeVIN(defaultZero(rs.getBigDecimal("vin_ratio_pct")))
                    .build();
        }
    }

    private static class PredictionRowMapper implements RowMapper<PredictionResponse> {
        @Override
        public PredictionResponse mapRow(ResultSet rs, int rowNum) throws SQLException {
            return PredictionResponse.builder()
                    .symbol(rs.getString("symbol"))
                    .predictDate(toLocalDate(rs, "predict_date"))
                    .targetDate(toLocalDate(rs, "target_date"))
                    .predictedClose(rs.getBigDecimal("predicted_close"))
                    .actualClose(rs.getBigDecimal("actual_close"))
                    .trend(rs.getString("trend"))
                    .modelUsed(rs.getString("model_used"))
                    .createdAt(toLocalDateTime(rs, "created_at"))
                    .build();
        }
    }

    private static class WyckoffRowMapper implements RowMapper<WyckoffAnalysisDTO> {
        @Override
        public WyckoffAnalysisDTO mapRow(ResultSet rs, int rowNum) throws SQLException {
            return WyckoffAnalysisDTO.builder()
                    .symbol(rs.getString("symbol"))
                    .phase(rs.getString("phase"))
                    .schematic(rs.getString("schematic"))
                    .trLow(rs.getBigDecimal("tr_low"))
                    .trHigh(rs.getBigDecimal("tr_high"))
                    .lastClose(rs.getBigDecimal("last_close"))
                    .lastDate(toLocalDate(rs, "last_date"))
                    .riskReward(rs.getBigDecimal("risk_reward"))
                    .dataJson(rs.getString("data_json"))
                    .build();
        }
    }

    private static String normalize(String symbol) {
        return symbol == null ? null : symbol.trim().toUpperCase();
    }

    private static BigDecimal calculateNet(BigDecimal buy, BigDecimal sell) {
        if (buy == null && sell == null) return null;
        return defaultZero(buy).subtract(defaultZero(sell));
    }

    private static Double calculateRatio(BigDecimal numerator, BigDecimal denominator) {
        if (numerator == null || denominator == null || denominator.compareTo(BigDecimal.ZERO) == 0) {
            return null;
        }
        return numerator.divide(denominator, 4, RoundingMode.HALF_UP).doubleValue();
    }

    private static BigDecimal scale(BigDecimal value) {
        return value == null ? null : value.setScale(2, RoundingMode.HALF_UP);
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
}