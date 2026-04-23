import React, { useEffect, useState } from 'react';
import { format } from 'date-fns';
import { FiClock, FiExternalLink } from 'react-icons/fi';
import newsService from '../services/news.service';
import './NewsSection.css';

const NewsSection = () => {
    const [news, setNews] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchNews = async () => {
            try {
                setLoading(true);
                const data = await newsService.getStockNews();
                setNews(data || []);
                setError(null);
            } catch (err) {
                console.error('Error fetching news:', err);
                setError('Không thể tải tin tức. Vui lòng thử lại sau.');
            } finally {
                setLoading(false);
            }
        };

        fetchNews();
    }, []);

    if (loading) {
        return <div className="news-loading">Đang tải tin tức...</div>;
    }

    if (error) {
        return <div className="news-error">{error}</div>;
    }

    if (news.length === 0) {
        return <div className="news-empty">Không có tin tức nào.</div>;
    }

    return (
        <div className="news-section">
            <h2 className="news-header">Tin tức thị trường chứng khoán</h2>
            <div className="news-grid">
                {news.map((article, index) => (
                    <a
                        key={index}
                        href={article.link}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="news-card glass-panel animate-fade-in"
                        style={{ animationDelay: `${index * 0.05}s` }}
                    >
                        {article.imageUrl && (
                            <div className="news-image-container">
                                <img src={article.imageUrl} alt={article.title} className="news-image" />
                            </div>
                        )}
                        <div className="news-content">
                            <h3 className="news-title">{article.title}</h3>
                            <p className="news-description">
                                {article.description && article.description.length > 150
                                    ? `${article.description.substring(0, 150)}...`
                                    : article.description}
                            </p>
                            <div className="news-footer">
                                <span className="news-date">
                                    <FiClock className="icon" />
                                    {article.pubDate ? format(new Date(article.pubDate), 'dd/MM/yyyy HH:mm') : 'Không rõ thời gian'}
                                </span>
                                <span className="news-read-more">
                                    Đọc tiếp <FiExternalLink className="icon" />
                                </span>
                            </div>
                        </div>
                    </a>
                ))}
            </div>
        </div>
    );
};

export default NewsSection;
