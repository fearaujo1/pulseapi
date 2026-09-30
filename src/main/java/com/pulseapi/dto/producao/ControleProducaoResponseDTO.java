package com.pulseapi.dto.producao;

import com.pulseapi.entity.producao.StatusProducao;

import java.time.LocalDateTime;

public record ControleProducaoResponseDTO(
        Long producaoId,
        StatusProducao status,
        StatusProducao statusAnterior,
        int itensRemovidosDaFila,
        LocalDateTime atualizadoEm,
        String mensagem
) {
}