package com.pulseapi.dto.dashboard;

import java.time.LocalDateTime;
import java.util.List;

public record DashboardResumoResponseDTO(

        int quantidadeProducoesAtivas,

        int quantidadeEquipamentosRelacionados,

        int quantidadeEquipamentosConectados,

        long quantidadeTotalItens,

        long quantidadeItensProcessados,

        long quantidadeItensConcluidos,

        double percentualGeralProcessado,

        List<DashboardProducaoResponseDTO> producoes,

        List<DashboardEquipamentoResponseDTO> equipamentos,

        LocalDateTime atualizadoEm

) {
}