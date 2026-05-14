package com.example.DoAn.exception.ai;

import org.springframework.http.HttpStatusCode;

public class AiIntegrationException extends RuntimeException {

    private final HttpStatusCode statusCode;

    public AiIntegrationException(String message, HttpStatusCode statusCode) {
        super(message);
        this.statusCode = statusCode;
    }

    public HttpStatusCode getStatusCode() {
        return statusCode;
    }
}
