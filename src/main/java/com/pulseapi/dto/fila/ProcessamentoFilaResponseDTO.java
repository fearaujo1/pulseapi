package com.pulseapi.dto.fila;

import com.pulseapi.entity.StatusFilaImpressao;

public record ProcessamentoFilaResponseDTO(
        Long filaId,
        Long equipamentoId,
        Long ordemFila,
        String payload,
        StatusFilaImpressao status,
        Integer quantidadeFifoAntes,
        Integer quantidadeFifoDepois,
        String mensagem
) {
}