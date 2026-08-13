package com.pulseapi.dto.layout;

import com.pulseapi.entity.EstrategiaMontagemPayload;

import java.util.Map;

public record MontarPayloadResponseDTO(
        Long layoutId,
        String layoutNome,
        EstrategiaMontagemPayload estrategia,
        Map<String, String> valoresFormatados,
        String payload,
        int tamanhoBytes
) {
}