package com.pulseapi.dto.producao;

import com.pulseapi.entity.producao.StatusProducao;

import java.time.LocalDateTime;

public record CancelamentoProducaoResponseDTO(
        Long producaoId,
        StatusProducao status,
        int quantidadeItensCancelados,
        int quantidadeFilasCanceladas,
        String motivo,
        LocalDateTime canceladaEm,
        String mensagem
) {
}