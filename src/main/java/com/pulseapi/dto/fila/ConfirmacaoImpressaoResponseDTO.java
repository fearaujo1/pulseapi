package com.pulseapi.dto.fila;

import com.pulseapi.entity.impressao.StatusFilaImpressao;

import java.time.LocalDateTime;

public record ConfirmacaoImpressaoResponseDTO(
        Long filaId,
        Long equipamentoId,
        StatusFilaImpressao status,
        Integer quantidadeFifoAtual,
        LocalDateTime impressoEm,
        String mensagem
) {
}