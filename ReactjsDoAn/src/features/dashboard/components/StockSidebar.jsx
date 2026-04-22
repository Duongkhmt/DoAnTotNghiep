import React, { useState, useEffect } from 'react';
import { FiChevronLeft, FiChevronRight, FiSearch } from 'react-icons/fi';
import marketService from '../services/market.service';
import './StockSidebar.css';

const StockSidebar = ({ selectedSymbol, onSelectSymbol }) => {
    const [isCollapsed, setIsCollapsed] = useState(false);
    const [stocks, setStocks] = useState([]);
    const [searchKeyword, setSearchKeyword] = useState('');
    const [loading, setLoading] = useState(false);

    // Initial fetch of all stocks
    useEffect(() => {
        const fetchStocks = async () => {
            setLoading(true);
            try {
                const data = await marketService.getAllStocks();
                setStocks(data || []);
            } catch (err) {
                console.error("Failed to fetch stocks:", err);
            } finally {
                setLoading(false);
            }
        };
        fetchStocks();
    }, []);

    // Handle search whenever keyword changes (debounce could be added for optimization)
    useEffect(() => {
        const searchStocks = async () => {
            // Wait 500ms before making API request to avoid spamming
            const timeoutId = setTimeout(async () => {
                if (searchKeyword.trim() === '') {
                    // Reset to all stocks if search is empty
                    try {
                        const data = await marketService.getAllStocks();
                        setStocks(data || []);
                    } catch (err) {
                        console.error("Failed to fetch all stocks:", err);
                    }
                    return;
                }

                setLoading(true);
                try {
                    const data = await marketService.searchStocks(searchKeyword);
                    setStocks(data || []);
                } catch (err) {
                    console.error("Failed to search stocks:", err);
                } finally {
                    setLoading(false);
                }
            }, 500);

            return () => clearTimeout(timeoutId);
        };

        searchStocks();
    }, [searchKeyword]);

    return (
        <aside className={`stock-sidebar ${isCollapsed ? 'collapsed' : ''}`}>
            <button
                className="sidebar-toggle-btn"
                onClick={() => setIsCollapsed(!isCollapsed)}
                title={isCollapsed ? "Mở rộng danh sách mã" : "Thu gọn"}
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
                            onChange={(e) => setSearchKeyword(e.target.value.toUpperCase())}
                        />
                    </div>
                )}

                <div className="symbols-list custom-scrollbar">
                    {loading && <div className="loading-text">Đang tải...</div>}
                    {!loading && stocks.length === 0 && (
                        <div className="loading-text">Không tìm thấy mã</div>
                    )}
                    {!loading && stocks.map((stock) => {
                        // Backend might return a String or an Object depending on DTO
                        const symbol = typeof stock === 'string' ? stock : (stock.symbol || 'N/A');
                        return (
                            <button
                                key={symbol}
                                className={`symbol-btn ${selectedSymbol === symbol ? 'active' : ''}`}
                                onClick={() => onSelectSymbol(symbol)}
                                title={typeof stock !== 'string' && stock.companyName ? stock.companyName : symbol}
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
