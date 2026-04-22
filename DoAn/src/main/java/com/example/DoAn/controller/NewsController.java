package com.example.DoAn.controller;

import com.example.DoAn.dto.NewsArticleDTO;
import com.example.DoAn.service.NewsService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/news")
@RequiredArgsConstructor
@CrossOrigin(origins = "*") // Allow frontend to call
public class NewsController {

    private final NewsService newsService;

    @GetMapping("/stock")
    public ResponseEntity<List<NewsArticleDTO>> getStockNews() {
        return ResponseEntity.ok(newsService.getStockMarketNews());
    }
}
