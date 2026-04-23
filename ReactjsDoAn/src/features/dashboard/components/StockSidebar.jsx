import React, { useEffect, useState } from 'react';
import { FiChevronLeft, FiChevronRight, FiSearch } from 'react-icons/fi';
import marketService from '../services/market.service';
import './StockSidebar.css';

const StockSidebar = ({ selectedSymbol, onSelectSymbol }) => {
    const [isCollapsed, setIsCollapsed] = useState(false);
    const [stocks, setStocks] = useState([]);
    const [searchKeyword, setSearchKeyword] = useState('');
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        const fetchStocks = async () => {
            setLoading(true);
            try {
                const data = await marketService.getAllStocks();
                setStocks(data || []);
            } catch (error) {
                console.error('Failed to fetch stocks:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchStocks();
    }, []);

    useEffect(() => {
        const timeoutId = setTimeout(async () => {
            try {
                setLoading(true);
                const data = searchKeyword.trim()
                    ? await marketService.searchStocks(searchKeyword)
                    : await marketService.getAllStocks();
                setStocks(data || []);
            } catch (error) {
                console.error('Failed to search stocks:', error);
            } finally {
                setLoading(false);
            }
        }, 500);

        return () => clearTimeout(timeoutId);
    }, [searchKeyword]);

    return (
        <aside className={`stock-sidebar ${isCollapsed ? 'collapsed' : ''}`}>
            <button
                className="sidebar-toggle-btn"
                onClick={() => setIsCollapsed(!isCollapsed)}
                title={isCollapsed ? 'Mở rộng danh sách mã' : 'Thu gọn'}
            >
                {isCollapsed ? <FiChevronRight /> : <FiChevronLeft />}
            </button>
            <div className="sidebar-container">
                <div className="sidebar-header">
                    {!isCollapsed && <h3>Danh mục</h3>}
                </div>

                {!isCollapsed && (
                    <div className="sidebar-search">
                        <FiSearch className="search-icon" />
                        <input
                            type="text"
                            placeholder="Tìm mã cổ phiếu..."
                            value={searchKeyword}
                            onChange={(event) => setSearchKeyword(event.target.value.toUpperCase())}
                        />
                    </div>
                )}

                <div className="symbols-list custom-scrollbar">
                    {loading && <div className="loading-text">Đang tải...</div>}
                    {!loading && stocks.length === 0 && <div className="loading-text">Không tìm thấy mã</div>}
                    {!loading && stocks.map((stock) => {
                        const symbol = typeof stock === 'string' ? stock : (stock.symbol || 'N/A');
                        const companyName = typeof stock === 'string' ? '' : (stock.companyName || '');
                        const exchange = typeof stock === 'string' ? '' : (stock.exchange || '');
                        return (
                            <button
                                key={symbol}
                                className={`symbol-btn ${selectedSymbol === symbol ? 'active' : ''}`}
                                onClick={() => onSelectSymbol(symbol)}
                                title={[symbol, companyName, exchange].filter(Boolean).join(' - ')}
                            >
                                {symbol}
                            </button>
                        );
                    })}
                </div>
            </div>
        </aside>
    );
};

export default StockSidebar;
