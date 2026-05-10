import React, { useEffect, useRef } from 'react';
import { createChart, CandlestickSeries, HistogramSeries, LineSeries } from 'lightweight-charts';

const TradingViewChart = ({ data }) => {
    const chartContainerRef = useRef();
    const chartRef = useRef(null);

    useEffect(() => {
        if (!chartContainerRef.current || !data || data.length === 0) return;

        // Loại bỏ trùng lặp và format ngày
        const uniqueDataMap = new Map();
        [...data].forEach(item => {
            if (item.tradingDate) {
                // Đảm bảo format là YYYY-MM-DD
                const timeStr = typeof item.tradingDate === 'string' 
                    ? item.tradingDate.split('T')[0] 
                    : new Date(item.tradingDate).toISOString().split('T')[0];
                uniqueDataMap.set(timeStr, { ...item, timeStr });
            }
        });

        const sortedData = Array.from(uniqueDataMap.values()).sort((a, b) => new Date(a.timeStr) - new Date(b.timeStr));

        const candleData = sortedData
            .filter(item => item.open != null && item.close != null && item.high != null && item.low != null)
            .map(item => ({
                time: item.timeStr,
                open: Number(item.open),
                high: Number(item.high),
                low: Number(item.low),
                close: Number(item.close),
            }));

        const volumeData = sortedData
            .filter(item => item.volume != null)
            .map(item => ({
                time: item.timeStr,
                value: Number(item.volume),
                color: item.close >= item.open ? 'rgba(38, 166, 154, 0.5)' : 'rgba(239, 83, 80, 0.5)'
            }));

        const sma20Data = sortedData.filter(item => item.sma20 != null).map(item => ({
            time: item.timeStr,
            value: Number(item.sma20),
        }));

        const sma50Data = sortedData.filter(item => item.sma50 != null).map(item => ({
            time: item.timeStr,
            value: Number(item.sma50),
        }));

        // Khởi tạo chart
        const chart = createChart(chartContainerRef.current, {
            layout: {
                background: { type: 'solid', color: 'transparent' },
                textColor: '#475569',
            },
            grid: {
                vertLines: { color: '#f1f5f9' },
                horzLines: { color: '#f1f5f9' },
            },
            rightPriceScale: {
                borderColor: '#cbd5e1',
            },
            timeScale: {
                borderColor: '#cbd5e1',
                timeVisible: true,
            },
            autoSize: true,
        });

        chartRef.current = chart;

        // Thêm Series
        const candlestickSeries = chart.addSeries(CandlestickSeries, {
            upColor: '#26a69a',
            downColor: '#ef5350',
            borderVisible: false,
            wickUpColor: '#26a69a',
            wickDownColor: '#ef5350',
        });
        candlestickSeries.setData(candleData);

        const sma20Series = chart.addSeries(LineSeries, {
            color: '#0f766e',
            lineWidth: 2,
        });
        sma20Series.setData(sma20Data);

        const sma50Series = chart.addSeries(LineSeries, {
            color: '#b45309',
            lineWidth: 2,
        });
        sma50Series.setData(sma50Data);

        const volumeSeries = chart.addSeries(HistogramSeries, {
            priceFormat: {
                type: 'volume',
            },
            priceScaleId: '', // set as an overlay
        });
        
        chart.priceScale('').applyOptions({
            scaleMargins: {
                top: 0.8, // volume chiếm 20% bên dưới
                bottom: 0,
            },
        });
        
        volumeSeries.setData(volumeData);

        chart.timeScale().fitContent();

        const handleResize = () => {
            chart.applyOptions({
                width: chartContainerRef.current.clientWidth,
                height: chartContainerRef.current.clientHeight
            });
        };

        window.addEventListener('resize', handleResize);

        return () => {
            window.removeEventListener('resize', handleResize);
            chart.remove();
        };
    }, [data]);

    return (
        <div ref={chartContainerRef} style={{ width: '100%', height: '100%' }} />
    );
};

export default TradingViewChart;
