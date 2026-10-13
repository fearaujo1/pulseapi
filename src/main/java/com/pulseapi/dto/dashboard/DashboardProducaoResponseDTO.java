package com.pulseapi.dto.dashboard;

import com.pulseapi.entity.producao.StatusProducao;

public record DashboardProducaoResponseDTO(

        Long producaoId,

        String codigoOrdem,

        Long linhaId,

        String linhaNome,

        Long equipamentoId,

        String equipamentoNome,

        StatusProducao status,

        long quantidadeTotal,

        long quantidadeProcessada,

        long quantidadeConcluida,

        long quantidadeRestante,

        double percentualProcessado,

        double percentualConcluido

) {
}