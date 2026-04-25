import React, { useEffect, useState } from 'react';
import { format } from 'date-fns';
import { FiClock, FiExternalLink, FiCpu, FiChevronRight, FiX, FiInfo } from 'react-icons/fi';
import newsService from '../services/news.service';
import './NewsSection.css';

const NewsSection = () => {
    const [news, setNews] = useState([]);
    const [selectedArticle, setSelectedArticle] = useState(null);
    const [fullContent, setFullContent] = useState('');
    const [summary, setSummary] = useState('');
    const [loading, setLoading] = useState(true);
    const [contentLoading, setContentLoading] = useState(false);
    const [aiLoading, setAiLoading] = useState(false);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchNews = async () => {
            try {
                setLoading(true);
                const data = await newsService.getStockNews();
                setNews(data || []);
                if (data && data.length > 0) {
                    handleSelectArticle(data[0]);
                }
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

    const handleSelectArticle = async (article) => {
        setSelectedArticle(article);
        setFullContent('');
        setSummary('');
        setContentLoading(true);
        try {
            const content = await newsService.getNewsDetail(article.link);
            setFullContent(content);
        } catch (err) {
            console.error('Error fetching content:', err);
            setFullContent('Không thể tải nội dung bài báo. Bạn có thể đọc trực tiếp tại link nguồn.');
        } finally {
            setContentLoading(false);
        }
    };

    const handleSummarize = async (e, article) => {
        e.stopPropagation();
        setSelectedArticle(article);
        setSummary('');
        setAiLoading(true);
        try {
            const aiSummary = await newsService.summarizeNews(article.link);
            setSummary(aiSummary);
        } catch (err) {
            console.error('Error summarizing:', err);
            setSummary('Lỗi khi gọi AI tóm tắt.');
        } finally {
            setAiLoading(false);
        }
    };

    if (loading) return <div className="news-loading">Đang tải tin tức...</div>;
    if (error) return <div className="news-error">{error}</div>;

    return (
        <div className="news-container animate-fade-in">
            {/* Sidebar List */}
            <div className="news-sidebar custom-scrollbar">
                <div className="sidebar-header">
                    <h3>Tin tức thị trường</h3>
                    <span className="news-count">{news.length} tin mới</span>
                </div>
                <div className="news-list">
                    {news.map((article, index) => (
                        <div
                            key={index}
                            className={`news-item-mini ${selectedArticle?.link === article.link ? 'active' : ''}`}
                            onClick={() => handleSelectArticle(article)}
                        >
                            <div className="news-item-content">
                                <span className="news-source">Nguồn tin</span>
                                <h4 className="news-item-title">{article.title}</h4>
                                <div className="news-item-footer">
                                    <span className="news-item-date">
                                        {article.pubDate ? format(new Date(article.pubDate), 'HH:mm dd/MM') : ''}
                                    </span>
                                    <button 
                                        className="btn-ai-mini"
                                        onClick={(e) => handleSummarize(e, article)}
                                        title="Tóm tắt bằng AI"
                                    >
                                        <FiCpu /> Tóm tắt AI
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Content Reader */}
            <div className="news-reader custom-scrollbar">
                {selectedArticle ? (
                    <div className="reader-content animate-slide-up">
                        <div className="reader-header">
                            <h2 className="reader-title">{selectedArticle.title}</h2>
                            <div className="reader-meta">
                                <span><FiClock /> {selectedArticle.pubDate ? format(new Date(selectedArticle.pubDate), 'dd/MM/yyyy HH:mm') : ''}</span>
                                <a href={selectedArticle.link} target="_blank" rel="noopener noreferrer">
                                    Xem bản gốc <FiExternalLink />
                                </a>
                            </div>
                        </div>

                        {/* AI Summary Box */}
                        {(aiLoading || summary) && (
                            <div className="ai-summary-box glass-panel animate-fade-in">
                                <div className="ai-summary-header">
                                    <FiCpu className="ai-icon" />
                                    <span>Tóm tắt thông minh bởi AI</span>
                                    {aiLoading && <div className="ai-pulse-dot"></div>}
                                </div>
                                <div className="ai-summary-body">
                                    {aiLoading ? (
                                        <div className="ai-typing">AI đang đọc bài báo và phân tích...</div>
                                    ) : (
                                        <div className="ai-result">
                                            {summary.split('\n').map((line, i) => (
                                                <p key={i}>{line}</p>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}

                        {selectedArticle.imageUrl && (
                            <img src={selectedArticle.imageUrl} alt={selectedArticle.title} className="reader-hero-image" />
                        )}

                        <div className="reader-body">
                            {contentLoading ? (
                                <div className="content-skeleton">
                                    <div className="skeleton-line"></div>
                                    <div className="skeleton-line"></div>
                                    <div className="skeleton-line w-3/4"></div>
                                </div>
                            ) : (
                                <div className="article-text">
                                    {fullContent || selectedArticle.description}
                                </div>
                            )}
                        </div>
                    </div>
                ) : (
                    <div className="reader-empty">
                        <FiInfo size={48} />
                        <p>Chọn một tin tức để đọc nội dung chi tiết</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default NewsSection;
