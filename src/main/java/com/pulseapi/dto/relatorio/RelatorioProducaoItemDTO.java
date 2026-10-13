package com.pulseapi.dto.relatorio;

import com.pulseapi.entity.producao.StatusProducao;

import java.time.LocalDateTime;

public record RelatorioProducaoItemDTO(
        Long id,
        String codigoOrdem,
        StatusProducao status,
        Long quantidadeTotal,

        Long linhaId,
        String linhaNome,

        Long equipamentoId,
        String equipamentoNome,

        Long layoutId,
        String layoutNome,

        LocalDateTime criadaEm,
        LocalDateTime iniciadaEm,
        LocalDateTime concluidaEm,
        LocalDateTime canceladaEm
) {
}