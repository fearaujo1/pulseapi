package com.pulseapi.dto.fila;

import com.pulseapi.entity.StatusFilaImpressao;

import java.time.LocalDateTime;
import java.util.Map;

public record FilaImpressaoResponseDTO(
        Long id,
        Long equipamentoId,
        String equipamentoNome,
        Long layoutId,
        String layoutNome,
        Map<String, String> valores,
        String payloadMontado,
        StatusFilaImpressao status,
        Long ordemFila,
        Integer tentativas,
        String mensagemErro,
        LocalDateTime criadoEm,
        LocalDateTime enviadoEm,
        LocalDateTime impressoEm
) {
}