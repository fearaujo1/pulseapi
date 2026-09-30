package com.pulseapi.dto.producao;

import com.pulseapi.entity.producao.StatusProducao;

import java.time.LocalDateTime;

public record ProducaoResponseDTO(

        Long id,
        Long versao,
        String codigoOrdem,
        StatusProducao status,
        Long quantidadeTotal,
        Integer validadeDias,
        String observacoes,

        Long linhaId,
        String linhaNome,

        Long equipamentoPrincipalId,
        String equipamentoPrincipalNome,

        Long layoutPrincipalId,
        String layoutPrincipalNome,

        Long equipamentoRetrabalhoId,
        String equipamentoRetrabalhoNome,

        Long layoutRetrabalhoId,
        String layoutRetrabalhoNome,

        String motivoCancelamento,
        LocalDateTime cargaFinalizadaEm,
        LocalDateTime iniciadaEm,
        LocalDateTime concluidaEm,
        LocalDateTime canceladaEm,
        LocalDateTime criadoEm,
        LocalDateTime atualizadoEm

) {
}