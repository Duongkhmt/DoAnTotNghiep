package com.example.DoAn.service;

import com.example.DoAn.config.properties.AiServiceProperties;
import com.example.DoAn.dto.ai.AiLatestPredictionDto;
import com.example.DoAn.dto.ai.AiMarketOverviewResponse;
import com.example.DoAn.dto.ai.AiScreeningHistoryResponse;
import com.example.DoAn.dto.ai.AiScreeningTodayResponse;
import com.example.DoAn.dto.ai.AiStockDetailResponse;
import com.example.DoAn.exception.ai.AiIntegrationException;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.core.ParameterizedTypeReference;
import org.springframework.http.HttpMethod;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Component;
import org.springframework.util.LinkedMultiValueMap;
import org.springframework.util.MultiValueMap;
import org.springframework.web.client.HttpStatusCodeException;
import org.springframework.web.client.ResourceAccessException;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.util.UriComponentsBuilder;

import java.net.URI;
import java.util.List;

@Slf4j
@Component
@RequiredArgsConstructor
public class AiClient {

    @Qualifier("aiRestTemplate")
    private final RestTemplate aiRestTemplate;
    private final AiServiceProperties aiServiceProperties;

    public AiScreeningTodayResponse getScreeningToday(String signal, String exchange, String industry) {
        return get(
                "/screening/today",
                queryParams(
                        "signal", signal,
                        "exchange", exchange,
                        "industry", industry
                ),
                AiScreeningTodayResponse.class
        );
    }

    public AiStockDetailResponse getStockDetail(String symbol) {
        return get("/stock/" + symbol.toUpperCase() + "/detail", new LinkedMultiValueMap<>(), AiStockDetailResponse.class);
    }

    public AiScreeningHistoryResponse getScreeningHistory(Integer days) {
        return get("/screening/history", queryParams("days", days), AiScreeningHistoryResponse.class);
    }

    public AiMarketOverviewResponse getMarketOverview() {
        return get("/market/overview", new LinkedMultiValueMap<>(), AiMarketOverviewResponse.class);
    }

    public List<AiLatestPredictionDto> getLatestPredictions(Integer limit) {
        return getList("/predictions/latest", queryParams("limit", limit), new ParameterizedTypeReference<>() {
        });
    }

    private <T> T get(String path, MultiValueMap<String, String> queryParams, Class<T> responseType) {
        URI uri = buildUri(path, queryParams);
        try {
            ResponseEntity<T> response = aiRestTemplate.exchange(uri, HttpMethod.GET, null, responseType);
            if (response.getBody() == null) {
                throw new AiIntegrationException("AI service returned an empty response.", HttpStatus.BAD_GATEWAY);
            }
            return response.getBody();
        } catch (ResourceAccessException ex) {
            log.error("AI service timeout or connection issue for {}", uri, ex);
            throw new AiIntegrationException("AI service is unavailable or timed out.", HttpStatus.GATEWAY_TIMEOUT);
        } catch (HttpStatusCodeException ex) {
            log.error("AI service returned error {} for {}", ex.getStatusCode(), uri, ex);
            throw new AiIntegrationException("AI service returned an error response.", ex.getStatusCode());
        }
    }

    private <T> List<T> getList(String path, MultiValueMap<String, String> queryParams, ParameterizedTypeReference<List<T>> responseType) {
        URI uri = buildUri(path, queryParams);
        try {
            ResponseEntity<List<T>> response = aiRestTemplate.exchange(uri, HttpMethod.GET, null, responseType);
            if (response.getBody() == null) {
                throw new AiIntegrationException("AI service returned an empty list.", HttpStatus.BAD_GATEWAY);
            }
            return response.getBody();
        } catch (ResourceAccessException ex) {
            log.error("AI service timeout or connection issue for {}", uri, ex);
            throw new AiIntegrationException("AI service is unavailable or timed out.", HttpStatus.GATEWAY_TIMEOUT);
        } catch (HttpStatusCodeException ex) {
            log.error("AI service returned error {} for {}", ex.getStatusCode(), uri, ex);
            throw new AiIntegrationException("AI service returned an error response.", ex.getStatusCode());
        }
    }

    private URI buildUri(String path, MultiValueMap<String, String> queryParams) {
        return UriComponentsBuilder
                .fromUriString(aiServiceProperties.getBaseUrl())
                .path(path)
                .queryParams(queryParams)
                .build(true)
                .toUri();
    }

    private MultiValueMap<String, String> queryParams(Object... values) {
        MultiValueMap<String, String> params = new LinkedMultiValueMap<>();
        for (int index = 0; index < values.length; index += 2) {
            Object key = values[index];
            Object value = values[index + 1];
            if (key != null && value != null && !value.toString().isBlank()) {
                params.add(key.toString(), value.toString());
            }
        }
        return params;
    }
}
