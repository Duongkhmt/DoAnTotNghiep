package com.example.DoAn.service;

import com.example.DoAn.dto.NewsArticleDTO;
import com.rometools.rome.feed.synd.SyndEntry;
import com.rometools.rome.feed.synd.SyndFeed;
import com.rometools.rome.io.SyndFeedInput;
import com.rometools.rome.io.XmlReader;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.io.ByteArrayInputStream;
import java.io.InputStream;
import java.net.HttpURLConnection;
import java.net.URL;
import java.time.ZoneId;
import java.util.ArrayList;
import java.util.List;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

@Slf4j
@Service
public class NewsService {

    private final GeminiService geminiService;

    public NewsService(GeminiService geminiService) {
        this.geminiService = geminiService;
    }

    // nhiều nguồn tin
    private static final String VNEXPRESS = "https://vnexpress.net/rss/kinh-doanh/chung-khoan.rss";
    private static final String CAFEF = "https://cafef.vn/thi-truong-chung-khoan.rss";
    private static final String VIETSTOCK = "https://vietstock.vn/RSS/chung-khoan.rss";

    public List<NewsArticleDTO> getStockMarketNews() {

        List<NewsArticleDTO> articles = new ArrayList<>();

        articles.addAll(fetchRSS(VNEXPRESS));
        articles.addAll(fetchRSS(CAFEF));
        articles.addAll(fetchRSS(VIETSTOCK));

        return articles;
    }

    public String scrapeContent(String url) {
        try {
            org.jsoup.nodes.Document doc = org.jsoup.Jsoup.connect(url)
                    .userAgent("Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36")
                    .timeout(10000)
                    .get();

            String[] selectors = {
                    "article.fck_detail", // VnExpress
                    "div.content_detail", // CafeF
                    "div.article-content", // VietStock
                    "div.post-content",
                    "div.detail-content",
                    ".content"
            };

            for (String selector : selectors) {
                org.jsoup.select.Elements elements = doc.select(selector);
                if (!elements.isEmpty()) {
                    return elements.text();
                }
            }
            return doc.body().text();
        } catch (Exception e) {
            log.error("Scraping error from {} : {}", url, e.getMessage());
            return null;
        }
    }

    public String summarizeArticle(String url) {
        String content = scrapeContent(url);
        if (content == null || content.length() < 100) {
            return "Không thể lấy nội dung bài báo để tóm tắt.";
        }
        String truncatedContent = content.length() > 5000 ? content.substring(0, 5000) : content;
        return geminiService.summarize(truncatedContent);
    }

    private List<NewsArticleDTO> fetchRSS(String rssUrl) {

        List<NewsArticleDTO> list = new ArrayList<>();

        try {

            URL url = new URL(rssUrl);

            HttpURLConnection connection = (HttpURLConnection) url.openConnection();

            connection.setRequestMethod("GET");

            connection.setRequestProperty(
                    "User-Agent",
                    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/120 Safari/537.36");

            connection.setConnectTimeout(10000);
            connection.setReadTimeout(10000);

            InputStream inputStream = connection.getInputStream();

            // đọc XML thành String
            String xml = new String(inputStream.readAllBytes());

            // bỏ DOCTYPE nếu có
            xml = xml.replaceAll("<!DOCTYPE[^>]*>", "");

            // tìm vị trí thẻ <rss>
            int start = xml.indexOf("<rss");
            if (start > 0) {
                xml = xml.substring(start);
            }

            SyndFeedInput input = new SyndFeedInput();

            SyndFeed feed = input.build(
                    new XmlReader(new ByteArrayInputStream(xml.getBytes()))
            );

            for (SyndEntry entry : feed.getEntries()) {

                String description = "";

                if (entry.getDescription() != null) {
                    description = entry.getDescription().getValue();
                }

                String imageUrl = extractImageUrl(description);

                String cleanDescription = description.replaceAll("<[^>]*>", "").trim();

                NewsArticleDTO article = NewsArticleDTO.builder()
                        .title(entry.getTitle())
                        .link(entry.getLink())
                        .description(cleanDescription)
                        .imageUrl(imageUrl)
                        .pubDate(
                                entry.getPublishedDate() != null
                                        ? entry.getPublishedDate()
                                        .toInstant()
                                        .atZone(ZoneId.systemDefault())
                                        .toLocalDateTime()
                                        : null)
                        .build();

                list.add(article);
            }

        } catch (Exception e) {

            log.error("RSS error from {} : {}", rssUrl, e.getMessage());
        }

        return list;
    }

    private String extractImageUrl(String html) {

        if (html == null)
            return null;

        Pattern pattern = Pattern.compile("<img[^>]+src=[\"']([^\"']+)[\"']");
        Matcher matcher = pattern.matcher(html);

        if (matcher.find()) {
            return matcher.group(1);
        }

        return null;
    }
}