package com.pulseapi.dto.relatorio;

import java.time.LocalDate;
import java.util.List;

public record RelatorioProducaoResponseDTO(
        LocalDate dataInicial,
        LocalDate dataFinal,

        Long total,
        Long aguardandoDados,
        Long prontas,
        Long emAndamento,
        Long pausadas,
        Long aguardandoAvaliacao,
        Long emRetrabalho,
        Long concluidas,
        Long canceladas,

        Long quantidadeTotalPlanejada,

        List<RelatorioProducaoItemDTO> itens
) {
}