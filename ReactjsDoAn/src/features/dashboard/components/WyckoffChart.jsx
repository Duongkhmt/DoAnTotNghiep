
import React, { useEffect, useState } from 'react';
import Plot from 'react-plotly.js';
import { FiCalendar, FiSearch } from 'react-icons/fi';
import marketService from '../services/market.service';
import './DashboardViews.css';

const WyckoffChart = ({ symbol, date, onSymbolChange, onDateChange }) => {
    const [historyData, setHistoryData] = useState([]);
    const [wyckoffData, setWyckoffData] = useState(null);
    const [loading, setLoading] = useState(false);
    const [endDate, setEndDate] = useState(date || new Date().toISOString().split('T')[0]);
    const [startDate, setStartDate] = useState(() => {
        const d = new Date(date || new Date().toISOString().split('T')[0]);
        d.setMonth(d.getMonth() - 9);
        return d.toISOString().split('T')[0];
    });

    useEffect(() => {
        if (!symbol) return;

        const fetchData = async () => {
            setLoading(true);
            try {
                const [history, wyckoff] = await Promise.all([
                    marketService.getStockHistoryByDateRange(symbol, startDate, endDate),
                    marketService.getWyckoffAnalysis(symbol)
                ]);

                const sortedHistory = [...history].sort((a, b) => new Date(a.tradeDate) - new Date(b.tradeDate));
                setHistoryData(sortedHistory);
                setWyckoffData(wyckoff);
            } catch (error) {
                console.error('Error fetching Wyckoff data:', error);
                setWyckoffData(null);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [symbol, startDate, endDate]);

    if (!symbol) return <div className="view-container">Chọn mã cổ phiếu</div>;

    const preparePlot = () => {
        if (!historyData || historyData.length === 0) return null;

        const x = historyData.map(d => d.tradeDate);
        const open = historyData.map(d => d.openPrice);
        const high = historyData.map(d => d.highPrice);
        const low = historyData.map(d => d.lowPrice);
        const close = historyData.map(d => d.closePrice);
        const volume = historyData.map(d => d.volume);

        const calcMA = (data, period) => data.map((_, i) => {
            if (i < period - 1) return null;
            const slice = data.slice(i - period + 1, i + 1);
            return slice.reduce((a, b) => a + b, 0) / period;
        });

        const calcRSI = (data, period = 14) => {
            if (data.length <= period) return new Array(data.length).fill(null);
            let gains = [], losses = [];
            for (let i = 1; i < data.length; i++) {
                let diff = data[i] - data[i - 1];
                gains.push(diff > 0 ? diff : 0);
                losses.push(diff < 0 ? -diff : 0);
            }
            let rsi = new Array(period + 1).fill(null);
            let avgGain = gains.slice(0, period).reduce((a, b) => a + b) / period;
            let avgLoss = losses.slice(0, period).reduce((a, b) => a + b) / period;
            for (let i = period; i < gains.length; i++) {
                avgGain = (avgGain * (period - 1) + gains[i]) / period;
                avgLoss = (avgLoss * (period - 1) + losses[i]) / period;
                rsi.push(100 - (100 / (1 + (avgLoss === 0 ? 100 : avgGain / avgLoss))));
            }
            return rsi;
        };

        const ma20 = calcMA(close, 20);
        const ma50 = calcMA(close, 50);
        const volMa20 = calcMA(volume, 20);
        const rsi14 = calcRSI(close, 14);

        const parsedData = wyckoffData?.dataJson ? JSON.parse(wyckoffData.dataJson) : {};
        const events = parsedData.events || [];

        const eventConfig = {
            "SC": { color: "#ef5350", symbol: "triangle-down", pos: "low" },
            "AR": { color: "#26a69a", symbol: "triangle-up", pos: "high" },
            "ST": { color: "#ab47bc", symbol: "diamond", pos: "low" },
            "Spring": { color: "#00bcd4", symbol: "star", pos: "low" },
            "SOS": { color: "#2196f3", symbol: "star", pos: "high" },
            "LPS": { color: "#ffa726", symbol: "circle", pos: "low" },
            "BC": { color: "#f06292", symbol: "triangle-up", pos: "high" },
            "Upthrust": { color: "#ffee58", symbol: "triangle-down", pos: "high" }
        };

        const annotations = events.map(ev => {
            const conf = eventConfig[ev.kind] || { color: "#fff", symbol: "circle", pos: "high" };
            const isHigh = conf.pos === "high";
            return {
                x: ev.date,
                y: ev.price,
                text: `<b>${ev.kind}</b>`,
                showarrow: true,
                arrowhead: 0,
                ax: 0,
                ay: isHigh ? -30 : 30,
                font: { color: conf.color, size: 10 },
                arrowcolor: conf.color,
                bgcolor: 'rgba(0,0,0,0.5)',
                bordercolor: conf.color,
                borderwidth: 1,
                xaxis: 'x', yaxis: 'y'
            };
        });

        // --- Phases based on events ---
        const phaseBounds = {
            "Phase A": events.find(e => e.kind === "SC")?.date,
            "Phase B": events.find(e => e.kind === "AR")?.date,
            "Phase C": events.find(e => e.kind === "Spring" || e.kind === "ST")?.date,
            "Phase D": events.find(e => e.kind === "SOS")?.date,
            "Phase E": events.find(e => e.kind === "LPS")?.date
        };

        const phaseColors = {
            "Phase A": "rgba(139, 0, 0, 0.2)",    // Dark Red
            "Phase B": "rgba(101, 67, 33, 0.15)",  // Dark Brown/Yellow
            "Phase C": "rgba(0, 0, 139, 0.2)",    // Dark Blue
            "Phase D": "rgba(0, 100, 0, 0.15)",   // Dark Green
            "Phase E": "rgba(50, 50, 50, 0.2)"    // Dark Grey
        };

        const shapes = [];
        const sortedPhaseDates = Object.entries(phaseBounds)
            .filter(([_, d]) => d)
            .sort((a, b) => new Date(a[1]) - new Date(b[1]));

        for (let i = 0; i < sortedPhaseDates.length; i++) {
            const [name, start] = sortedPhaseDates[i];
            const end = i < sortedPhaseDates.length - 1 ? sortedPhaseDates[i+1][1] : x[x.length - 1];
            shapes.push({
                type: 'rect', xref: 'x', yref: 'paper',
                x0: start, x1: end, y0: 0, y1: 1,
                fillcolor: phaseColors[name], line: { width: 0 }, layer: 'below'
            });
            annotations.push({
                x: start, y: 1.02, xref: 'x', yref: 'paper',
                text: `<span style="color:#aaa; font-size:11px"><b>${name}</b></span>`,
                showarrow: false, xanchor: 'left', yanchor: 'bottom'
            });
        }

        if (wyckoffData?.trHigh) {
            shapes.push({
                type: 'line', xref: 'x', yref: 'y',
                x0: x[0], x1: x[x.length - 1], y0: wyckoffData.trHigh, y1: wyckoffData.trHigh,
                line: { color: '#ff4d4d', width: 1.5, dash: 'dash' }
            });
        }
        if (wyckoffData?.trLow) {
            shapes.push({
                type: 'line', xref: 'x', yref: 'y',
                x0: x[0], x1: x[x.length - 1], y0: wyckoffData.trLow, y1: wyckoffData.trLow,
                line: { color: '#4ade80', width: 1.5, dash: 'dash' }
            });
        }

        // RSI horizontal dashed lines
        shapes.push({ type: 'line', xref: 'paper', yref: 'y3', x0: 0, x1: 1, y0: 70, y1: 70, line: { color: '#ff4d4d', width: 1, dash: 'dash' } });
        shapes.push({ type: 'line', xref: 'paper', yref: 'y3', x0: 0, x1: 1, y0: 50, y1: 50, line: { color: '#aaa', width: 1, dash: 'dash' } });
        shapes.push({ type: 'line', xref: 'paper', yref: 'y3', x0: 0, x1: 1, y0: 30, y1: 30, line: { color: '#4ade80', width: 1, dash: 'dash' } });

        const data = [
            {
                x: x, open: open, high: high, low: low, close: close,
                type: 'candlestick', name: symbol,
                increasing: { line: { color: '#26a69a', width: 1 }, fillcolor: '#26a69a' },
                decreasing: { line: { color: '#ef5350', width: 1 }, fillcolor: '#ef5350' }
            },
            { x: x, y: ma20, type: 'scatter', mode: 'lines', name: 'MA20', line: { color: '#ff9800', width: 1.5 } },
            { x: x, y: ma50, type: 'scatter', mode: 'lines', name: 'MA50', line: { color: '#2196f3', width: 1.5 } },
            {
                x: x, y: volume, type: 'bar', name: 'Volume',
                marker: { color: historyData.map(d => d.closePrice >= d.openPrice ? 'rgba(38, 166, 154, 0.4)' : 'rgba(239, 83, 80, 0.4)') },
                xaxis: 'x', yaxis: 'y2'
            },
            { x: x, y: volMa20, type: 'scatter', mode: 'lines', name: 'Vol MA20', line: { color: '#ff9800', width: 1 }, xaxis: 'x', yaxis: 'y2' },
            { x: x, y: rsi14, type: 'scatter', mode: 'lines', name: 'RSI(14)', line: { color: '#9c27b0', width: 1.5 }, xaxis: 'x', yaxis: 'y3' }
        ];

        return {
            data,
            layout: {
                template: 'plotly_dark',
                paper_bgcolor: '#000',
                plot_bgcolor: '#000',
                height: 900,
                margin: { t: 50, b: 30, l: 10, r: 80 },
                showlegend: true,
                legend: { orientation: "h", y: 1.05, x: 1, xanchor: "right", font: { size: 10 } },
                font: { family: 'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif' },
                xaxis: {
                    anchor: 'y3', type: 'date', showgrid: true, gridcolor: 'rgba(255, 255, 255, 0.03)', gridwidth: 0.5,
                    linecolor: '#222', rangeslider: { visible: false }, rangebreaks: [{ bounds: ["sat", "mon"] }]
                },
                yaxis: { domain: [0.4, 1], side: 'right', showgrid: true, gridcolor: 'rgba(255, 255, 255, 0.03)', gridwidth: 0.5, zeroline: false, tickfont: { size: 10, color: '#888' } },
                yaxis2: { domain: [0.18, 0.35], side: 'right', showgrid: true, gridcolor: 'rgba(255, 255, 255, 0.03)', gridwidth: 0.5, zeroline: false, tickfont: { size: 10, color: '#888' } },
                yaxis3: { domain: [0, 0.15], side: 'right', showgrid: true, gridcolor: 'rgba(255, 255, 255, 0.03)', gridwidth: 0.5, range: [0, 100], zeroline: false, tickfont: { size: 10, color: '#888' } },
                shapes,
                annotations: [
                    ...annotations,
                    {
                        x: 1, y: close[close.length-1], xref: 'paper', yref: 'y',
                        text: `<b>Close: ${close[close.length-1]?.toLocaleString()}</b>`,
                        showarrow: false, font: { color: '#fff', size: 11 },
                        bgcolor: '#2196f3', bordercolor: '#2196f3', borderwidth: 2, xanchor: 'left'
                    },
                    {
                        x: 1, y: wyckoffData?.trHigh, xref: 'paper', yref: 'y',
                        text: 'Resistance', showarrow: false, font: { color: '#ff4d4d', size: 10 },
                        xanchor: 'left'
                    },
                    {
                        x: 1, y: wyckoffData?.trLow, xref: 'paper', yref: 'y',
                        text: 'Support', showarrow: false, font: { color: '#4ade80', size: 10 },
                        xanchor: 'left'
                    }
                ]
            }
        };
    };

    const plot = preparePlot();

    return (
        <div className="view-container" style={{ background: '#000' }}>
            <div className="view-header" style={{ borderBottom: '1px solid #222', padding: '10px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                    <h2 style={{ fontSize: '1.2rem', color: '#fff', margin: 0 }}>{symbol} — Phân tích Wyckoff + VSA</h2>
                    {wyckoffData && (
                        <p style={{ color: '#888', fontSize: '0.85rem', margin: '4px 0 0' }}>
                            {wyckoffData.phase} {wyckoffData.schematic} — RR: {wyckoffData.riskReward || 'N/A'}
                        </p>
                    )}
                </div>
                <div className="view-controls" style={{ display: 'flex', gap: '10px' }}>
                    <input type="text" placeholder="Symbol..." value={symbol} onChange={(e) => onSymbolChange(e.target.value.toUpperCase())} className="modern-input" style={{ width: '100px' }} />
                    <input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} className="modern-input" />
                </div>
            </div>
            <div style={{ flex: 1, padding: '10px' }}>
                {plot ? (
                    <Plot
                        data={plot.data}
                        layout={plot.layout}
                        useResizeHandler={true}
                        style={{ width: "100%", height: "900px" }}
                        config={{ responsive: true, displaylogo: false, scrollZoom: false }}
                    />
                ) : (
                    <div className="loading-spinner">Đang tải biểu đồ...</div>
                )}
                {wyckoffData?.dataJson && (
                    <div className="narrative-box" style={{ marginTop: '20px', padding: '15px', background: '#111', borderRadius: '8px', border: '1px solid #222' }}>
                        <h4 style={{ color: '#2196f3', marginBottom: '10px' }}>Nhận định:</h4>
                        <div style={{ color: '#aaa', fontSize: '0.9rem', lineHeight: '1.6' }}>
                            {JSON.parse(wyckoffData.dataJson).narrative_vi.split('\n').map((line, i) => (
                                <p key={i}>{line}</p>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default WyckoffChart;
