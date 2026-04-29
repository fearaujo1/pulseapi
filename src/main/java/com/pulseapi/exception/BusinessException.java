package com.pulseapi.exception;

// O dado existe, mas quebra uma regra de negócio - evita o 400 Bad Request
public class BusinessException extends RuntimeException {
    public BusinessException(String message) {
        super(message);
    }
}
